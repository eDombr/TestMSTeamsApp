import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/interprefyTab/index.html")
@PreventIframe("/interprefyTab/config.html")
@PreventIframe("/interprefyTab/remove.html")
export class InterprefyTab {
}
