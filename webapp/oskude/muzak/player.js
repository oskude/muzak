import {api} from "/oskude/muzak/api.js";
import {edi} from "/oskude/muzak/edi.js";

export class OskudeMuzakPlayer extends HTMLElement
{
	constructor ()
	{
		super();

		const root = this.attachShadow({mode:"open"});
		this.shadowRoot.innerHTML = `
			<style>
				#player {
					width: 100%;
				}
				h1, h2 {
					padding: 0;
					margin: 0;
				}
				h1 {
					font-size: 140%;
				}
				h2 {
					font-size: 115%;
				}
				h2::before {
					content: "by ";
				}
			</style>
			<h1 id="title">&lt;title&gt;</h1>
			<h2 id="artist">&lt;artist&gt;</h2>
			<audio id="player"></audio>
			<button id="delete">delete</button>
			<button id="prev">prev</button>
			<button id="next">next</button>
		`;

		this.audio = root.querySelector("audio");
		this.titleElem = root.querySelector("#title");
		this.artistElem = root.querySelector("#artist");
		this.prevElem = root.querySelector("#prev");
		this.nextElem = root.querySelector("#next");
		this.deleteElem = root.querySelector("#delete");
	}

	connectedCallback ()
	{
		this.rootUrl = window.location.origin;
		this.audio.setAttribute("controls", true);
		this.audio.setAttribute("autoplay", true);
		this.audio.addEventListener("ended", this.selectNextTrack.bind(this));
		this.prevElem.addEventListener("click", this.selectPrevTrack.bind(this));
		this.nextElem.addEventListener("click", this.selectNextTrack.bind(this));
		this.deleteElem.addEventListener("click", this.deleteTrack.bind(this));
		edi.subscribe("audio.play.new", this.playNew.bind(this));
	}

	playNew (data)
	{
		this.currentTrack = data;
		this.titleElem.textContent = data.title;
		this.artistElem.textContent = data.artist;
		this.audio.src = data.href;
	}

	set lister (lister)
	{
		this.lister = lister;
	}

	selectPrevTrack ()
	{
		edi.trigger("audio.play.prev");
	}

	selectNextTrack ()
	{
		edi.trigger("audio.play.next");
	}

	deleteTrack ()
	{
		let msg = [
			"really delete?\n",
			this.currentTrack.title,
			`by ${this.currentTrack.artist}`
		].join("\n");

		if (window.confirm(msg)) {
			let url = new URL(this.rootUrl);
			api.deleteJson("/audio", {
				id: this.currentTrack.id
			}).then((x)=>{
				edi.trigger("playlist.remove.entry", this.currentTrack.listerId);
			}).catch((o)=>{
				console.error("todo 123 error", o);
			});
		}
	}
}

window.customElements.define(
	"oskude-muzak-player",
	OskudeMuzakPlayer
);
