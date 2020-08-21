import * as React from "react";
import * as OT from "@opentok/client";

interface ISidePanelProps {
    meetingId: string;
}

export default class SidePanel extends React.Component<ISidePanelProps, any> {
    public async componentWillMount() {
        fetch(`https://interprefy-be.azurewebsites.net/session/GetData?meetingId=${this.props.meetingId}`)
            .then(data => {
                return data.json();
            })
            .then((sessionData) => {
                const session = OT.initSession(sessionData.ApiKey, sessionData.SessionId);

                const publisher = OT.initPublisher();
                session.connect(sessionData.Token, (err) => {
                    if (session.capabilities.publish === 1) {
                        session.publish(publisher, () => { });
                    } else {
                        alert("You cannot publish an audio-video stream.");
                    }
                });

                session.on("streamCreated", (event) => {
                    session.subscribe(event.stream);
                });
            })
            .catch((err) => {
                alert("Failed to get opentok sessionId and token.");
            });
    }

    /**
     * The render() method to create the UI of the tab
     */
    public render() {
        return (
            <div className="colorWhite">
                SIDE PANEL!!!!!!!
                <p>Another content</p>
            </div>
        );
    }
}
