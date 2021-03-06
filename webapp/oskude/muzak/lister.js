import {api} from "/oskude/muzak/api.js";
import {edi} from "/oskude/muzak/edi.js";

export class OskudeMuzakLister extends HTMLElement
{
	constructor ()
	{
		super();

		const root = this.attachShadow({mode:"open"});
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: flex;
					flex-direction: column;
				}
				#entry-list-container {
					overflow-y: auto;
				}
				#entry-list-table {
					border-collapse: collapse;
					width: 100%;
				}
				.entry-row {
					border-bottom-width: 1px;
					border-bottom-style: solid;
					/* TODO: can we set currentColor alpha to 0.5 */
					border-bottom-color: currentColor;
				}
				.selected {
					filter: invert();
					backdrop-filter: invert(50%);
				}
			</style>
			<div id="entry-list-container">
				<table id="entry-list-table" cellpadding="0" cellspacing="0">
					<tbody id="entry-root"></tbody>
				</table>
			<div>
			<template id="template-oskude-muzak-lister-entry"><tr class="entry-row"><td class="entry-title"></td><td class="entry-artist"></td></tr></template>
		`;

		this.entryRoot = root.querySelector("#entry-root");
		this.entryListContainer = root.querySelector("#entry-list-container");
		this.results = root.querySelector("#results");

		this.entryTemplate = root.querySelector("#template-oskude-muzak-lister-entry");

		this.selectedElem = null;
		this.playList = [];
		this.currentPos = null;
	}

	connectedCallback ()
	{
		this.rootUrl = window.location.origin;
		edi.subscribe("audio.play.next", this.selectNext.bind(this));
		edi.subscribe("audio.play.prev", this.selectPrev.bind(this));
		edi.subscribe("playlist.remove.entry", this.removeTrack.bind(this));
		edi.subscribe("playlist.replace.list", this.show.bind(this));
	}

	show (data)
	{
		this.playList = new Map();

		// DELME: just wanted some variety during early development
		data.sort(()=>{
			return (Math.round(Math.random())-0.5)
		});

		for (let d of data) {
			this.playList.set(d.id, d);
		}

		this.showList();
	}

	showList ()
	{
		this.entryRoot.innerHTML = "";

		for (let [k, p] of this.playList) {
			let cloneElem = document.importNode(this.entryTemplate.content, true);
			let titleElem = cloneElem.querySelector(".entry-title");
			let artistElem = cloneElem.querySelector(".entry-artist");
			let rowElem = cloneElem.querySelector(".entry-row");
			let url = new URL(this.rootUrl);

			titleElem.textContent = p.title;
			artistElem.textContent = p.artist;

			url.pathname = "/audio";
			url.searchParams.set("id", p.id);

			p.href = url.href;
			p.elem = rowElem;
			p.listerId = k;

			rowElem.dataset.playListPos = k;
			rowElem.addEventListener("click", this.handleRowClick.bind(this));

			this.entryRoot.appendChild(cloneElem);
		}
	}

	removeTrack (listerId)
	{
		let e = this.playList.get(listerId);
		this.next();
		e.elem.parentNode.removeChild(e.elem);
		this.playList.delete(listerId);
		this.select();
	}

	handleRowClick (e)
	{
		this.currentPos = e.currentTarget.dataset.playListPos;
		this.select();
	}

	select ()
	{
		edi.trigger("audio.play.new", this.playList.get(this.currentPos));

		if (this.selectedElem) {
			this.selectedElem.classList.remove("selected");
		}

		this.selectedElem = this.playList.get(this.currentPos).elem;
		this.selectedElem.classList.add("selected");

		let y = this.selectedElem.offsetTop;
		y -= this.entryListContainer.getBoundingClientRect().height / 2;
		y += this.selectedElem.offsetHeight / 2;
		this.entryListContainer.scrollTo(0, y);
	}

	selectNext ()
	{
		this.next();
		this.select();
	}

	selectPrev ()
	{
		this.prev();
		this.select();
	}

	next ()
	{
		let next = this.selectedElem.nextElementSibling;
		if (!next) {
			next = this.selectedElem.parentNode.firstChild;
		}
		this.currentPos = next.dataset.playListPos;
	}

	prev ()
	{
		let prev = this.selectedElem.previousElementSibling;
		if (!prev) {
			prev = this.selectedElem.parentNode.lastChild;
		}
		this.currentPos = prev.dataset.playListPos;
	}
}

window.customElements.define(
	"oskude-muzak-lister",
	OskudeMuzakLister
);
