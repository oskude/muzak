import {OskudeMuzakPlayer} from "/oskude/muzak/player.js";
import {OskudeMuzakSearcher} from "/oskude/muzak/searcher.js";
import {OskudeMuzakLister} from "/oskude/muzak/lister.js";

class OskudeMuzak extends HTMLElement
{
	constructor ()
	{
		super();

		this.attachShadow({mode:"open"});
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: flex;
					flex-direction: column;
				}
			</style>
			<oskude-muzak-player></oskude-muzak-player>
			<oskude-muzak-searcher></oskude-muzak-searcher>
			<oskude-muzak-lister></oskude-muzak-lister>
		`;
	}
}

window.customElements.define(
	"oskude-muzak",
	OskudeMuzak
);
