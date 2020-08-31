import * as React from "react";
import TeamsBaseComponent, { ITeamsBaseComponentState } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import { Provider, ThemePrepared, themes } from "@fluentui/react-northstar";

import Settings from "./Settings";
import SidePanel from "./SidePanel/SidePanel";
/**
 * State for the interprefyTabTab React component
 */
export interface IInterprefyTabState extends ITeamsBaseComponentState {
    entityId?: string;
    teamsTheme: any;
    frameContext: string;
    meetingId: string;
    email: string;
}

/**
 * Properties for the interprefyTabTab React component
 */
export interface IInterprefyTabProps {

}

/**
 * Implementation of the InterprefyTab content page
 */
export class InterprefyTab extends TeamsBaseComponent<IInterprefyTabProps, IInterprefyTabState> {
    public async componentWillMount() {
        this.updateComponentTheme(this.getQueryVariable("theme"));

        if (await this.inTeams()) {
            microsoftTeams.initialize();
            microsoftTeams.registerOnThemeChangeHandler(this.updateComponentTheme);
            microsoftTeams.getContext((context: any) => {
                microsoftTeams.appInitialization.notifySuccess();
                const decodedMeetingId = atob(context.meetingId);
                const meetingId = decodedMeetingId.slice(decodedMeetingId.indexOf("meeting") + 8, decodedMeetingId.indexOf("@thread"));
                this.setState({
                    entityId: context.entityId,
                    frameContext: context.frameContext,
                    meetingId,
                    email: context.userPrincipalName
                });
                this.updateTheme(context.theme);
            });
        } else {
            this.setState({
                entityId: "This is not hosted in Microsoft Teams"
            });
        }
    }

    /**
     * The render() method to create the UI of the tab
     */
    public render() {
        return (
            <Provider theme={this.state.teamsTheme}>
                {
                    this.state.frameContext === "content" ?
                        <Settings meetingId={this.state.meetingId} email={this.state.email}></Settings> :
                        (this.state.frameContext === "sidePanel" ?
                            <SidePanel meetingId={this.state.meetingId}></SidePanel> : null)
                }
                {/* <SidePanel meetingId={this.state.meetingId}></SidePanel> */}
                {/* <Settings meetingId={this.state.meetingId} email={this.state.email}></Settings> */}
            </Provider>
        );
    }

    private updateComponentTheme = (teamsTheme: string = "default"): void => {
        let theme: ThemePrepared;

        switch (teamsTheme) {
            case "default":
                theme = themes.teams;
                break;
            case "dark":
                theme = themes.teamsDark;
                break;
            case "contrast":
                theme = themes.teamsHighContrast;
                break;
            default:
                theme = themes.teams;
                break;
        }
        // update the state
        this.setState(Object.assign({}, this.state, {
            teamsTheme: theme
        }));
    }
}
