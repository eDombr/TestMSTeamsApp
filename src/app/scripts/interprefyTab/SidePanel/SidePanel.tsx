import * as React from "react";
import * as OT from "@opentok/client";
import * as _ from "lodash";
import { Slider, Flex, Header, VolumeDownIcon, Text, VolumeUpIcon, SettingsIcon } from "@fluentui/react-northstar";

import axios from "../../axios/axios-interprefy";

interface ISidePanelProps {
    meetingId: string;
}

interface ISidePanelState {
    subscriberVolume: number;
    conferenceVolume: number;
    languages: any[];
    isSettings: boolean;
}

export default class SidePanel extends React.Component<ISidePanelProps, ISidePanelState> {
    private session: any = null;
    private subscriber: any = null;

    constructor(props) {
        super(props);

        this.state = {
            subscriberVolume: 50,
            conferenceVolume: 50,
            languages: [
            ],
            isSettings: false
        };
    }

    public async componentDidMount() {
        try {
            const response = await axios.get(`Meetings/sessions?meetingId=${this.props.meetingId}`);
            const languages = response.data;
            _.remove(languages, ["language", "source"]);

            this.setState({
                languages
            });
        } catch (error) {
            if (error.response.status === 404 && error.response.data.errorMessage === "Meeting not found") {
                return;
            }

            alert(`Error: ${error}`);
        }
    }

    public changeSubscriberVolume = (e, data): void => {
        if (this.subscriber) {
            this.subscriber.setAudioVolume(+data.value);
        }
        this.setState({ subscriberVolume: +data.value });
    }

    public changeConferenceVolume = (e, data): void => {
        this.setState({ conferenceVolume: +data.value });
    }

    public onItemSelected = async (language) => {
        alert("select item");
        if (this.session) {
            if (this.subscriber) {
                this.session.unsubscribe(this.subscriber);
                this.subscriber = null;
            }

            this.session.disconnect();
            this.session = null;
        }

        const body = {
            sessionId: language.sessionId,
            meetingId: this.props.meetingId
        };

        try {
            const response = await axios.post(`Meetings/generateottoken`, body);
            const data = response.data;

            let updatedLanguages = _.cloneDeep(this.state.languages);
            updatedLanguages = _.map(updatedLanguages, (lng) => ({
                ...lng,
                active: lng.language === language.language
            }));
            this.setState({languages: updatedLanguages});

            this.session = OT.initSession(data.apiKey, language.sessionId);

            // const publisher = OT.initPublisher();
            this.session.connect(data.token, (err) => {
                // if (session.capabilities.publish === 1) {
                //     session.publish(publisher, () => { });
                // } else {
                //     alert("You cannot publish an audio-video stream.");
                // }
            });

            this.session.on("streamCreated", (sessionEvent) => {
                this.subscriber = this.session.subscribe(sessionEvent.stream);
                this.subscriber.setAudioVolume(this.state.subscriberVolume);
            });
        } catch (err) {
            alert(`Error: ${err}`);
        }
    }

    public onToggleSettings = () => {
        this.setState({
            isSettings: !this.state.isSettings
        });
    }

    /**
     * The render() method to create the UI of the tab
     */
    public render() {
        const settingButtonClasses = ["noPaddingButton", "cursorPointer"];

        if (this.state.isSettings) {
            settingButtonClasses.push("interprefyPrimaryColor");
        }

        return (
            <Flex
                column gap="gap.medium"
                styles={{
                    padding: "10px 20px"
                }}
            >
                <Flex.Item>
                    <Flex space="between" vAlign="center">
                        <Header as="h2" content="interprefy" className="interprefyPrimaryColor"></Header>
                        <SettingsIcon
                            className={settingButtonClasses.join(" ")}
                            onClick={this.onToggleSettings}
                            styles={{
                                position: "relative",
                                top: "4px"
                            }}/>
                    </Flex>
                </Flex.Item>
                {
                    this.state.isSettings ?
                        <Flex.Item>
                            <>
                                <Text
                                    className="interprefyGreyColor interprefyLabel"
                                    content="Audio"
                                    style={{
                                        display: "block",
                                    }}
                                />
                                <Flex
                                    inline
                                    hAlign="center"
                                    vAlign="center"
                                    gap="gap.smaller"
                                    style={{paddingBottom: "25px"}}>
                                    <VolumeDownIcon />
                                    <Slider fluid value={this.state.subscriberVolume} onChange={this.changeSubscriberVolume} />
                                    <VolumeUpIcon />
                                </Flex>
                            </>
                        </Flex.Item> : null

                }
                <Flex.Item>
                    <>
                        <Text
                            className="interprefyGreyColor interprefyLabel"
                            content="Language"
                            style={{
                                display: "block"
                            }}
                        />
                        <Flex column className="languageList" gap="gap.medium">
                            {
                                _.map(this.state.languages, language =>
                                    <LanguageItem
                                        key={language.languageCode}
                                        label={language.language}
                                        active={language.active}
                                        onSelectItem={this.onItemSelected.bind(this, language)}/>
                                )
                            }
                        </Flex>
                    </>
                </Flex.Item>
            </Flex>
        );
    }
}

const LanguageItem = (props: ILanguageItemProps) => {
    const classes = ["languageItem"];

    if (props.active) {
        classes.push("active");
    }

    return (
        <Flex.Item>
            <Flex onClick={props.onSelectItem} className={classes.join(" ")} hAlign="center">
                <span>{props.label}</span>
            </Flex>
        </Flex.Item>
    );
};

interface ILanguageItemProps {
    onSelectItem: (language: any) => void;
    label: string;
    active: boolean;
}
