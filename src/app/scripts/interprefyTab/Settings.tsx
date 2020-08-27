import * as React from "react";
import { Flex, Header, Dropdown, TextArea, Input, Button } from "@fluentui/react-northstar";
import { map } from "lodash";

import axios from "../axios/axios-interprefy";

interface ISettingsProps {
    meetingId: string;
}

const options = [
    { languageCode: "RUS", language: "Russian" },
    { languageCode: "ESP", language: "Spanish" },
    { languageCode: "ENG", language: "English" },
    { languageCode: "DEU", language: "German" },
    { languageCode: "AFR", language: "Afrikaans" },
    { languageCode: "ALB", language: "Albanian" },
    { languageCode: "AMH", language: "Amharic" },
    { languageCode: "ARA", language: "Arabic" },
    { languageCode: "ARM", language: "Armenian" },
    { languageCode: "ASM", language: "Assamese" },
    { languageCode: "AYM", language: "Aymara" },
    { languageCode: "AZE", language: "Azerbaijani" },
    { languageCode: "BAM", language: "Bamanankan" },
    { languageCode: "BAK", language: "Bashkir" },
    { languageCode: "BAQ", language: "Basque" },
    { languageCode: "BEL", language: "Belarusan" },
    { languageCode: "BEN", language: "Bengali" },
    { languageCode: "BIH", language: "Bhojpuri" },
    { languageCode: "BIS", language: "Bislama" },
    { languageCode: "BOS", language: "Bosnian" },
    { languageCode: "BUL", language: "Bulgarian" },
    { languageCode: "BUR", language: "Burmese" },
    { languageCode: "CAT", language: "Catalan" },
    { languageCode: "CHE", language: "Chechen" },
    { languageCode: "HRV", language: "Croatian" },
    { languageCode: "CZE", language: "Czech" },
];

const items = map(options, "language");

const Settings: React.FC<ISettingsProps> = (props) => {
    const [settingForm, setSettingForm] = React.useState({
        languages: [],
        notices: "",
        keywords: "",
        industry: ""
    });

    const onChangeControl = (e, { id, value }) => {
        const formControls = { ...settingForm };
        formControls[id] = value;

        setSettingForm(formControls);
    };

    const onSaveSettings = async () => {
        const body = {
            languages: settingForm.languages,
            meetingId: props.meetingId
        };

        alert(body.meetingId);

        try {
            await axios.post("Meetings", body);
            alert("Meeting has been updated");
        } catch (err) {
            alert(`Error: ${err}`);
        }
    };

    return (
        <Flex>
            <Flex.Item size="size.half">
                <Flex
                    fill={true}
                    column styles={{
                        padding: ".8rem 0 .8rem .5rem"
                    }}
                    gap="gap.medium"
                >
                    <Flex.Item>
                        <Header content="Interprefy" />
                    </Flex.Item>
                    <Flex.Item>
                        <Dropdown
                            fluid
                            placeholder="Languages"
                            id="languages"
                            onChange={onChangeControl}
                            multiple={true}
                            items={items}
                        />
                    </Flex.Item>
                    <Flex.Item>
                        <TextArea
                            fluid
                            id="notices"
                            placeholder="Notices..."
                            onChange={onChangeControl} />
                    </Flex.Item>
                    <Flex.Item>
                        <Input
                            fluid
                            id="industry"
                            placeholder="Industry..."
                            onChange={onChangeControl} />
                    </Flex.Item>
                    <Flex.Item>
                        <Input
                            fluid
                            id="keywords"
                            placeholder="Keywords..."
                            onChange={onChangeControl} />
                    </Flex.Item>
                    <Flex.Item>
                        <Button content="Save" onClick={onSaveSettings} />
                    </Flex.Item>
                </Flex>
            </Flex.Item>
        </Flex>
    );
};

export default Settings;
