import * as React from "react";
import { Flex, Text, Dropdown } from "@fluentui/react-northstar";

import axios from "./../../axios/axios-interprefy";

const DefaultLanguage = (props) => {
    const [defaultLanguage, setDefaultLanguage] = React.useState();

    React.useEffect(() => {
        if (props.languages.length) {
            fetchDefaultLanguage();
        }
    }, [props.languages]);

    const onSelectDefaultLanguage = async (e, { value }): Promise<void> => {
        setDefaultLanguage(() => {
            saveDefaultLanguage(value);

            return value;
        });
    };

    const saveDefaultLanguage = async (language: string) => {
        try {
            const body = {
                language
            };

            await axios.post(`meetings/${props.meetingId}/participants/${props.userId}/defaultlanguage`, body);

            alert("Default language has been saved");
        } catch (error) {
            alert(`Error during saving default language: ${error}`);
        }
    };

    const fetchDefaultLanguage = async (): Promise<void> => {
        try {
            const response = await axios.get(`meetings/${props.meetingId}/participants/${props.userId}/defaultlanguage`);
            const lng = response.data;

            if (!lng || !lng.language) {
                return;
            }

            setDefaultLanguage(lng.language);
        } catch (error) {
            if (error.response.status === 404) {
                return;
            }

            alert(`Error during fetching default language: ${error}`);
        }
    };

    return (
        <Flex
            styles={({ theme: { siteVariables } }) => ({
                backgroundColor: siteVariables.colorScheme.default.background2,
            })}
            className="fullWidth fullHeight paddingContainer">
            <Flex.Item size="size.half">
                <Flex column gap="gap.medium">
                    <Flex.Item>
                        <>
                            <div className="settingsHeader">
                                Welcome to Interprefy App
                            </div>
                        </>
                    </Flex.Item>
                    <Flex.Item>
                        <>
                            <Text
                                className="interprefyLabel marginTop20 displayBlock"
                                content="Please add your default language"
                            />
                            {
                                props.languages.length ?
                                    <Dropdown
                                        id="languages"
                                        value={defaultLanguage}
                                        onChange={onSelectDefaultLanguage}
                                        inverted
                                        items={props.languages}
                                    /> :
                                    <Text
                                        className="interprefyLabel marginTop20 displayBlock"
                                        content="Organizer have not added languages yet..."
                                    />
                            }
                        </>
                    </Flex.Item>
                </Flex>
            </Flex.Item>
        </Flex>
    );
};

export default DefaultLanguage;
