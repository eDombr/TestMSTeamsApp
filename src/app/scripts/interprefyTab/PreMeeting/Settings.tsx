import * as React from "react";
import { Flex, Header, Dropdown, TextArea, Input, Button, Text } from "@fluentui/react-northstar";
import * as _ from "lodash";

import axios from "../../axios/axios-interprefy";
import StatusBar from "./StatusBar";
import DefaultLanguage from "./DefaultLanguage";

interface ISettingsProps {
    meetingId: string;
    email: string;
    userId: string;
}

const Settings: React.FC<ISettingsProps> = (props) => {
    const [settingForm, setSettingForm] = React.useState({
        languages: [],
        // industriesAndSectors: [],
        industries: "",
        specialRequest: ""
    });

    const [editMode, setEditMode] = React.useState(false);
    const [languages, setLanguages] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [statuses, setStatuses] = React.useState([
        {
            label: "Request", content: `Please enter the languages and the subject matter of your meeting. Interprefy will contact you by email you shortly with a quote.
                Please note that there is a minimum lead time of 4 days for interpretation assignments.`, status: "active"
        },
        {
            label: "Pending", content: `Thank you for your request, you will receive your quote by email shortly.
                If you need to contact us in the meantime, please send an email to msteams@interprefy.com`,
        },
        { label: "Quote Sent", content: `Your quote has been sent, if you have not received it please send an email to msteams@interprefy.com` },
        {
            label: "Confirmed", content: `Interpretation for your event has been confirmed.
                Please do not hesitate to get in contact with us if we can be of assistance at msteams@interprefy.com`
        }
    ]);

    const [activeStatus, setActiveStatus] = React.useState({} as any);
    const [role, setRole] = React.useState("");

    React.useEffect(() => {
        const fetchMeetingInfo = async () => {
            try {
                const response = await axios.get(`Meetings/meetinginfo?meetingId=${props.meetingId}&email=${props.email}`);
                const meetingInfo = response.data;

                setRole(meetingInfo.organizerEmail === props.email ? "organizer" : "attendee");
            } catch (error) {
                alert(`Fetch User Info Error: ${error.response.data.errorMessage}`);
            }
        };
        fetchMeetingInfo();
    }, [props.meetingId, props.email]);

    React.useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await axios.get(`meetings/${props.meetingId}`);

                if (!response.data) {
                    return;
                }

                const meeting = response.data;

                setEditMode(meeting.languages.length > 0);
                activateStatus(meeting.quoteStatus);

                setSettingForm({
                    ...settingForm,
                    ...meeting,
                    industries: meeting.industries[0] // TODO: change approach after fixing API
                });
            } catch (error) {
                if (error.response.status === 404) {
                    return;
                }

                alert(`Error: ${error.response.data.errorMessage}`);
            }
        };

        fetchLanguages();
    }, [props.meetingId]);

    React.useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await axios.get(`languages`);

                if (!response.data || !response.data.length) {
                    return;
                }

                const languagesList = _.map(response.data, "name");

                setLanguages(languagesList);
            } catch (error) {
                alert(`Error: ${error.response.data.errorMessage}`);
            }
        };

        fetchLanguages();
    }, []);

    React.useEffect(() => {
        const active = _.find(statuses, ["status", "active"]);
        setActiveStatus(active);
    }, [statuses]);

    const onChangeControl = (e, { id, value }) => {
        const formControls = { ...settingForm };
        formControls[id] = value;

        setSettingForm(formControls);
    };

    const onSaveSettings = async () => {
        const body = {
            languages: settingForm.languages,
            meetingId: props.meetingId,
            email: props.email,
            industries: [settingForm.industries],
            specialRequest: settingForm.specialRequest
        };

        try {
            setIsLoading(true);

            if (editMode) {
                await axios.patch("Meetings", body);
            } else {
                await axios.post("Meetings", body);
                setEditMode(true);
            }

            setIsLoading(false);

            alert("Meeting has been updated");
        } catch (err) {
            alert(`Error: ${err}`);
        }
    };

    const activateStatus = (statusLabel: string): void => {
        let updatedStatuses = _.cloneDeep(statuses);

        const statusIndex = _.findIndex(statuses, ["label", statusLabel]);

        if (statusIndex === -1) {
            return;
        }

        updatedStatuses = _.map(updatedStatuses, (status, index) => {
            if (statusIndex < index) {
                return {...status, status: "completed"};
            }

            if (statusIndex === index) {
                return {...status, status: "active"};
            }

            return status;
        });

        setStatuses(updatedStatuses);
    };

    if (!role) {
        return null;
    }

    return (
        role !== "organizer" ?
            <DefaultLanguage meetingId={props.meetingId} languages={settingForm.languages} userId={props.userId}/> :
            <>
                <StatusBar statuses={statuses} />
                <Flex
                    styles={({ theme: { siteVariables } }) => ({
                        backgroundColor: siteVariables.colorScheme.default.background2,
                    })}
                    column
                    className="fullWidth fullHeight paddingContainer">
                    <Flex>
                        <Flex.Item size="size.half">
                            <Flex
                                column
                                gap="gap.medium"
                            >
                                {activeStatus ?
                                    <Flex.Item>
                                        <>
                                            <div className="settingsHeader">
                                                {activeStatus!.label}
                                            </div>
                                            <Text
                                                className="interprefyLabel displayBlock marginBottom25"
                                                content={activeStatus!.content}
                                            />
                                        </>
                                    </Flex.Item> : null
                                }
                                <Flex.Item>
                                    <>
                                        <Text
                                            className="interprefyLabel displayBlock"
                                            content="Add Languages"
                                        />
                                        <Dropdown
                                            fluid
                                            id="languages"
                                            className={activeStatus.label !== "Request" ? "disabled" : ""}
                                            value={settingForm.languages}
                                            onChange={onChangeControl}
                                            disabled={activeStatus.label !== "Request"}
                                            multiple
                                            search
                                            inverted
                                            items={languages}
                                            styles={({ theme: { siteVariables } }) => ({
                                                border: `1px solid ${siteVariables.colorScheme.default.background5}`,
                                            })}
                                        />
                                    </>
                                </Flex.Item>
                                {/* <Flex.Item>
                                        <>
                                            <Text
                                                content="Industries and sectors"
                                                className="interprefyLabel displayBlock"
                                            />
                                            <Dropdown
                                                fluid
                                                id="industriesAndSectors"
                                                value={settingForm.industriesAndSectors}
                                                onChange={onChangeControl}
                                                multiple
                                                search
                                                inverted
                                                items={industriesAndSectors}
                                                styles={({ theme: { siteVariables } }) => ({
                                                    border: `1px solid ${siteVariables.colorScheme.default.background5}`,
                                                })} />
                                        </>
                                    </Flex.Item> */}
                                <Flex.Item>
                                    <>
                                        <Text
                                            content="Specialised Subject"
                                            className="interprefyLabel displayBlock"
                                        />
                                        <Input
                                            fluid
                                            id="industries"
                                            onChange={onChangeControl}
                                            disabled={activeStatus.label !== "Request"}
                                            inverted
                                            value={settingForm.industries}
                                            styles={({ theme: { siteVariables } }) => ({
                                                border: `1px solid ${siteVariables.colorScheme.default.background5}`,
                                                background: siteVariables.colorScheme.default.background
                                            })} />
                                    </>
                                </Flex.Item>
                                <Flex.Item styles={{
                                    paddingBottom: "25px"
                                }}>
                                    <>
                                        <Flex>
                                            <Text
                                                content="Special Request"
                                                className="interprefyLabel displayBlock"
                                            />
                                            <Text
                                                content="(Optional)"
                                                className="interprefyLabel optional displayBlock"
                                            />
                                        </Flex>
                                        <TextArea
                                            fluid
                                            id="specialRequest"
                                            inverted
                                            onChange={onChangeControl}
                                            value={settingForm.specialRequest}
                                            disabled={activeStatus.label !== "Request"}
                                            variables={{ height: "90px" }}
                                            styles={({ theme: { siteVariables } }) => ({
                                                border: `1px solid ${siteVariables.colorScheme.default.background5}`,
                                                background: siteVariables.colorScheme.default.background
                                            })} />
                                    </>
                                </Flex.Item>
                                <Flex.Item>
                                    <Flex className="buttonWrapper">
                                        <Flex column gap="gap.medium">
                                            {
                                                activeStatus.label !== "Request" ?
                                                    <Text
                                                        content="If you would like change your request, please click Edit"
                                                        className="optional displayBlock"
                                                    /> : null
                                            }
                                            <Flex hAlign="start" gap="gap.medium">
                                                <Button
                                                    content={activeStatus.label !== "Request" ? "Edit" : "Save"}
                                                    loading={isLoading}
                                                    primary
                                                    onClick={onSaveSettings} />
                                                <Button content="Cancel" secondary />
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                </Flex.Item>
                                <Flex.Item>
                                    <img className="poweredBy" src="../assets/powered_interprefy.png" alt="powered_by"/>
                                </Flex.Item>
                            </Flex>
                        </Flex.Item>
                    </Flex>
                </Flex>
            </>
    );
};

export default Settings;
