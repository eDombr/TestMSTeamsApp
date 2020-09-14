import * as React from "react";
import * as OT from "@opentok/client";
import * as _ from "lodash";
import { Slider, Flex, VolumeDownIcon, Text, SettingsIcon, ChevronStartIcon, ChevronEndIcon } from "@fluentui/react-northstar";

import axios from "../../axios/axios-interprefy";
import InterprefyVoiceIcon from "./InterprefyVoiceIcon";

interface ISidePanelProps {
    meetingId: string;
}

interface ISidePanelState {
    subscriberVolume: number;
    conferenceVolume: number;
    languages: any[];
    isSettings: boolean;
    sourceSubscriber: any;
}

export default class SidePanel extends React.Component<ISidePanelProps, ISidePanelState> {
    private session: any = null;
    private subscriber: any = null;

    private sourceSession: any = null;
    // private sourceSubscriber: any = null;

    constructor(props) {
        super(props);

        this.state = {
            subscriberVolume: 50,
            conferenceVolume: 50,
            languages: [
            ],
            isSettings: false,
            sourceSubscriber: null
        };
    }

    public async componentDidMount() {
        await this.getLanguages();

        await this.joinBot();
    }

    public componentWillUnmount() {
        this.disconnectLanguageSession();
        this.disconnectSourceSession();
    }

    public changeAudioVolume = (e, data): void => {
        if (this.subscriber) {
            this.subscriber.setAudioVolume(+data.value);
        }

        this.setState({ subscriberVolume: 100 - +data.value });
        this.setState({ conferenceVolume: +data.value });
    }

    public onItemSelected = async (language) => {
        const prevLng = _.find(this.state.languages, "active");

        this.disconnectLanguageSession();

        if (prevLng && (prevLng.language === language.language)) {
            this.resetLanguages();

            return;
        }

        const body = {
            sessionId: language.sessionId,
            meetingId: this.props.meetingId
        };

        try {
            const response = await axios.post(`Meetings/generateottoken`, body);
            const data = response.data;

            this.resetLanguages(language);

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
                className="fullHeight fullWidth"
                column
                space="between"
                styles={{
                    padding: "0 20px"
                }}>
                <Flex
                    column gap="gap.medium">
                    {/* <Flex.Item>
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
                                gap="gap.smaller">
                                <VolumeDownIcon />
                                <Slider fluid onChange={this.changeAudioVolume} />
                                <InterprefyVoiceIcon />
                            </Flex>
                        </>
                    </Flex.Item> */}
                    <Flex.Item>
                        <>
                            {/* <Text
                                className="interprefyGreyColor interprefyLabel"
                                content="Language"
                                style={{
                                    display: "block",
                                    marginTop: "30px"
                                }}
                            /> */}
                            <Flex column className="languageList" gap="gap.medium">
                                {
                                    _.map(this.state.languages, language =>
                                        <LanguageItem
                                            key={language.languageCode}
                                            label={language.language}
                                            active={language.active}
                                            onSelectItem={this.onItemSelected.bind(this, language)} />
                                    )
                                }
                            </Flex>
                        </>
                    </Flex.Item>
                </Flex>
                <Flex hAlign="center" styles={{ paddingBottom: "20px", position: "relative" }}>
                    <Flex.Item>
                        <div id="sourceSubscriber"></div>
                    </Flex.Item>
                    {
                        this.state.sourceSubscriber ?
                            <Flex className="bottomCarousel" hAlign="center" vAlign="center">
                                <Flex.Item>
                                    <>
                                        <ChevronStartIcon size="smaller" />
                                        <div className="bottomCarouselButton">ASL</div>
                                        <ChevronEndIcon size="smaller" />
                                    </>
                                </Flex.Item>
                            </Flex> : null
                    }
                </Flex>
            </Flex>
        );
    }

    private async createSourceSession(language: any) {
        const body = {
            sessionId: language.sessionId,
            meetingId: this.props.meetingId
        };

        try {
            const response = await axios.post(`Meetings/generateottoken`, body);
            const data = response.data;

            this.sourceSession = OT.initSession(data.apiKey, language.sessionId);

            this.sourceSession.connect(data.token, (err) => {
            });

            this.sourceSession.on("streamCreated", (sessionEvent) => {
                const connectionData = JSON.parse(sessionEvent.stream.connection.data);

                if (connectionData.name === "sss") {
                    return;
                }

                if (connectionData.name !== "interprefy_signer7") {
                    return;
                }

                const options = { subscribeToAudio: false, subscribeToVideo: true };
                this.setState({ sourceSubscriber: this.sourceSession.subscribe(sessionEvent.stream, "sourceSubscriber", options) });
            });
        } catch (err) {
            alert(`Error during creating source session: ${err}`);
        }
    }

    private disconnectLanguageSession(): void {
        if (this.session) {
            if (this.subscriber) {
                this.session.unsubscribe(this.subscriber);
                this.subscriber = null;
            }

            this.session.disconnect();
            this.session = null;
        }
    }

    private disconnectSourceSession(): void {
        if (this.sourceSession) {
            if (this.state.sourceSubscriber) {
                this.sourceSession.unsubscribe(this.state.sourceSubscriber);
            }
            this.setState({sourceSubscriber: null});
        }

        this.sourceSession.disconnect();
        this.sourceSession = null;
    }

    private resetLanguages(language?: any): void {
        let updatedLanguages = _.cloneDeep(this.state.languages);
        updatedLanguages = _.map(updatedLanguages, (lng) => ({
            ...lng,
            active: language && lng.language === language.language
        }));
        this.setState({ languages: updatedLanguages });
    }

    private async getLanguages(): Promise<void> {
        try {
            const response = await axios.get(`Meetings/sessions?meetingId=${this.props.meetingId}`);
            const languages = response.data;

            const sourceLanguage = _.find(languages, ["language", "source"]);
            await this.createSourceSession(sourceLanguage);
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

    private async joinBot(): Promise<void> {
        try {
            const body = {
                MeetingId: this.props.meetingId
            };

            await axios.post("meetings/joinbot", body);
        } catch (error) {
            alert(`Error during joining bot: ${error}`);
        }
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
