import * as React from "react";
import * as OT from "@opentok/client";

import axios from "../axios/axios-interprefy";
import { Slider, Flex, Header, Dropdown } from "@fluentui/react-northstar";
import { map, find, remove } from "lodash";

interface ISidePanelProps {
    meetingId: string;
}

interface ISidePanelState {
    subscriberVolume: number;
    conferenceVolume: number;
    languages: any[];
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
            ]
        };
    }

    public async componentDidMount() {
        try {
            const response = await axios.get(`Meetings/sessions?meetingId=${this.props.meetingId}`);
            const languages = response.data;
            remove(languages, ["language", "source"]);

            this.setState({
                languages
            });
        } catch (err) {
            alert(`Error: ${err}`);
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

    public onItemSelected = async (event, { value }) => {
        if (this.session) {
            if (this.subscriber) {
                this.session.unsubscribe(this.subscriber);
                this.subscriber = null;
            }

            this.session.disconnect();
            this.session = null;
        }

        const language = find(this.state.languages, ["language", value]);
        const body = {
            sessionId: language.sessionId,
            meetingId: this.props.meetingId
        };

        try {
            const response = await axios.post(`Meetings/generateottoken`, body);
            const data = response.data;

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

    /**
     * The render() method to create the UI of the tab
     */
    public render() {
        const items = map(this.state.languages, "language");
        return (
            <Flex
                column gap="gap.medium"
                styles={{
                    padding: ".8rem 0 .8rem .5rem"
                }}
            >
                <Flex.Item>
                    <Dropdown
                        fluid
                        placeholder="Choose a language"
                        onChange={this.onItemSelected}
                        items={items}
                    />
                </Flex.Item>
                <Flex.Item>
                    <Header as="h4" content="Interpreter volume" />
                </Flex.Item>
                <Flex.Item>
                    <Slider fluid value={this.state.subscriberVolume} onChange={this.changeSubscriberVolume} />
                </Flex.Item>
                <Flex.Item>
                    <Header as="h4" content="Conference volume" />
                </Flex.Item>
                <Flex.Item>
                    <Slider fluid value={this.state.conferenceVolume} onChange={this.changeConferenceVolume} />
                </Flex.Item>
            </Flex>
        );
    }
}
