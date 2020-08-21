import * as React from "react";
import {useEffect} from "react";
import { Provider, Flex, Header, Dropdown, TextArea, Input} from "@fluentui/react-northstar";
import { map, find } from "lodash";


interface ISettingsProps {
    theme: any;
}

const Settings: React.FC<ISettingsProps> = (props) => {
    const options = [
        { key: "AFR", content: "Afrikaans" },
        { key: "ALB", content: "Albanian" },
        { key: "AMH", content: "Amharic" },
        { key: "ARA", content: "Arabic" },
        { key: "ARM", content: "Armenian" },
        { key: "ASM", content: "Assamese" },
        { key: "AYM", content: "Aymara" },
        { key: "AZE", content: "Azerbaijani" },
        { key: "BAM", content: "Bamanankan" },
        { key: "BAK", content: "Bashkir" },
        { key: "BAQ", content: "Basque" },
        { key: "BEL", content: "Belarusan" },
        { key: "BEN", content: "Bengali" },
        { key: "BIH", content: "Bhojpuri" },
        { key: "BIS", content: "Bislama" },
        { key: "BOS", content: "Bosnian" },
        { key: "BUL", content: "Bulgarian" },
        { key: "BUR", content: "Burmese" },
        { key: "CAT", content: "Catalan" },
        { key: "CHE", content: "Chechen" },
        { key: "HRV", content: "Croatian" },
        { key: "CZE", content: "Czech" },
    ];

    const items = map(this.options, "content");

    const onItemSelected = (event, { value }) => {
        const codes = map(value, (v) => {
            const option = find(options, ["content", v]);
            return option.key;
        });
    };

    return (
        <Provider theme={props.theme}>
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
                                onChange={onItemSelected}
                                multiple={true}
                                items={items}
                            />
                        </Flex.Item>
                        <Flex.Item>
                            <TextArea fluid placeholder="Notices..." />
                        </Flex.Item>
                        <Flex.Item>
                            <Input fluid placeholder="Industry..." />
                        </Flex.Item>
                        <Flex.Item>
                            <Input fluid placeholder="Keywords..." />
                        </Flex.Item>
                    </Flex>
                </Flex.Item>
            </Flex>
        </Provider>
    );
};

export default Settings;
