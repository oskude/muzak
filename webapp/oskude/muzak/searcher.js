import {api} from "/oskude/muzak/api.js";
import {edi} from "/oskude/muzak/edi.js";

export class OskudeMuzakSearcher extends HTMLElement
{
	constructor ()
	{
		super();

		const root = this.attachShadow({mode:"open"});
		this.shadowRoot.innerHTML = `
			<style>
				#results::after {
					content: " Results"
				}
			</style>
			<div id="search-container">
				<input id="where-title" type="checkbox"/><label>Title</label>
				<input id="where-artist" type="checkbox"/><label>Artist</label>
				<input id="query" type="text"/>
				<button id="search">Search</button>
				<label id="results">0</label>
			</div>
		`;

		this.queryInput = root.querySelector("#query");
		this.searchButton = root.querySelector("#search");
		this.whereArtistInput = root.querySelector("#where-artist");
		this.whereTitleInput = root.querySelector("#where-title");
		this.results = root.querySelector("#results");
	}

	connectedCallback ()
	{
		this.rootUrl = window.location.origin;
		this.searchButton.addEventListener("click", this.search.bind(this));
	}

	search ()
	{
		api.getJson("/audio", {
			fields: ["id","artist","title"],
			artist: this.whereArtistInput.checked ? this.queryInput.value : '',
			title: this.whereTitleInput.checked ? this.queryInput.value : ''
		}).then((x)=>{
			this.results.textContent = x.length;
			edi.trigger("playlist.replace.list", x);
		}).catch((o)=>{
			console.error("hmmmm", o);
		});
	}
}
window.customElements.define(
	"oskude-muzak-searcher",
	OskudeMuzakSearcher
);
