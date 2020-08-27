import * as React from "react";
import {
    Provider,
    Flex,
    Header,
    ThemePrepared,
    themes
} from "@fluentui/react-northstar";
import TeamsBaseComponent, { ITeamsBaseComponentState } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";

export interface IInterprefyTabConfigState extends ITeamsBaseComponentState {
    teamsTheme: ThemePrepared;
    mathOperator: string;
    value: string;
}

export interface IInterprefyTabConfigProps {
}

/**
 * Implementation of InterprefyTab configuration page
 */
export class InterprefyTabConfig extends TeamsBaseComponent<IInterprefyTabConfigProps, IInterprefyTabConfigState> {

    public async componentWillMount() {
        this.updateComponentTheme(this.getQueryVariable("theme"));

        if (await this.inTeams()) {
            microsoftTeams.initialize();

            microsoftTeams.getContext((context: microsoftTeams.Context) => {
                this.setState({
                    value: context.entityId
                });
                this.updateTheme(context.theme);
                microsoftTeams.settings.setValidityState(true);
                microsoftTeams.appInitialization.notifySuccess();
            });

            microsoftTeams.settings.registerOnSaveHandler((saveEvent: microsoftTeams.settings.SaveEvent) => {
                // Calculate host dynamically to enable local debugging
                const host = "https://" + window.location.host;
                microsoftTeams.settings.setSettings({
                    contentUrl: host + "/interprefyTab/?name={loginHint}&tenant={tid}&group={groupId}&theme={theme}",
                    websiteUrl: host + "/interprefyTab/?name={loginHint}&tenant={tid}&group={groupId}&theme={theme}",
                    suggestedDisplayName: "InterprefyTab",
                    removeUrl: host + "/interprefyTab/remove.html?theme={theme}",
                    entityId: this.state.value
                });
                saveEvent.notifySuccess();
            });
        } else {
        }
    }

    public render() {
        return (
            <Provider theme={this.state.theme}>
                <Flex fill={true}>
                    <Flex.Item>
                        <Header content="Click 'Save' to add the tab to the meeting" />
                    </Flex.Item>
                </Flex>
            </Provider>
        );
    }

    private updateComponentTheme = (teamsTheme: string = "default"): void => {
        let componentTheme: ThemePrepared;

        switch (teamsTheme) {
            case "default":
                componentTheme = themes.teams;
                break;
            case "dark":
                componentTheme = themes.teamsDark;
                break;
            case "contrast":
                componentTheme = themes.teamsHighContrast;
                break;
            default:
                componentTheme = themes.teams;
                break;
        }
        // update the state
        this.setState(Object.assign({}, this.state, {
            teamsTheme: componentTheme
        }));
    }
}
