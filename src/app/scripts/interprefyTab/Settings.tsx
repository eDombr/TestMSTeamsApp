import * as React from "react";
import { Flex, Header, Dropdown, TextArea, Input, Button, Text } from "@fluentui/react-northstar";
import { map, remove } from "lodash";

import axios from "../axios/axios-interprefy";

interface ISettingsProps {
    meetingId: string;
    email: string;
}

const Settings: React.FC<ISettingsProps> = (props) => {
    const [settingForm, setSettingForm] = React.useState({
        languages: [],
        industry: ""
    });

    const [editMode, setEditMode] = React.useState(false);
    const [languages, setLanguages] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await axios.get(`Meetings/sessions?meetingId=${props.meetingId}`);

                if (!response.data || !response.data.length) {
                    return;
                }

                const selectedLanguages = map(response.data, "language");
                remove(selectedLanguages, langauge => langauge === "source");

                setEditMode(selectedLanguages.length > 0);

                setSettingForm({
                    ...settingForm,
                    languages: selectedLanguages
                });
            } catch (error) {
                if (error.response.status === 404 && error.response.data.errorMessage === "Meeting not found") {
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

                const languagesList = map(response.data, "name");

                setLanguages(languagesList);
            } catch (error) {
                alert(`Error: ${error.response.data.errorMessage}`);
            }
        };

        fetchLanguages();
    }, []);

    const onChangeControl = (e, { id, value }) => {
        const formControls = { ...settingForm };
        formControls[id] = value;

        setSettingForm(formControls);
    };

    const onSaveSettings = async () => {
        const body = {
            languages: settingForm.languages,
            meetingId: props.meetingId,
            email: props.email
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

    return (
        <Flex styles={({ theme: { siteVariables } }) => ({
            backgroundColor: siteVariables.colorScheme.default.background2,
            padding: "15px",
          })}>
            <Flex.Item size="size.half">
                <Flex
                    column
                    gap="gap.medium"
                >
                    <Flex.Item>
                        <Header as="h3" content="Simultaneous Interpreting" />
                    </Flex.Item>
                    <Flex.Item>
                        <>
                            <Text
                                className="interprefyLabel"
                                content="Add Languages"
                                style={{
                                    display: "block",
                                }}
                            />
                            <Dropdown
                                fluid
                                id="languages"
                                value={settingForm.languages}
                                onChange={onChangeControl}
                                multiple
                                search
                                inverted
                                items={languages}
                            />
                        </>
                    </Flex.Item>
                    <Flex.Item>
                        <>
                            <Text
                                content="Industries and sectors"
                                className="interprefyLabel"
                                style={{
                                    display: "block",
                                }}
                            />
                            <Input
                                fluid
                                inverted
                                id="industry"
                                onChange={onChangeControl} />
                        </>
                    </Flex.Item>
                    <Flex.Item styles={{
                        paddingBottom: "25px"
                    }}>
                        <>
                            <Text
                                content="Special Request"
                                className="interprefyLabel"
                                style={{
                                    display: "block",
                                }}
                            />
                            <Flex hAlign="start">
                                <Button className="noPaddingButton" text primary content="Add" />
                            </Flex>
                        </>
                    </Flex.Item>
                    <Flex.Item>
                        <Flex hAlign="start" gap="gap.medium">
                            <Button content={isLoading ? "Processing" : "Save"} loading={isLoading} primary onClick={onSaveSettings} />
                            <Button content="Cancel" secondary onClick={onSaveSettings} />
                        </Flex>
                    </Flex.Item>
                </Flex>
            </Flex.Item>
        </Flex>
    );
};

export default Settings;
