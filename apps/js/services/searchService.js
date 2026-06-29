import {
    getAllNotes
} from "./noteService.js";

const RECENT_KEY =
    "serenotes_recent_searches";

export function search(query){

    if(!query){

        return [];

    }

    query = query.toLowerCase();

    return getAllNotes().filter(note=>{

        const title =
            (note.title || "")
            .toLowerCase();

        const content =
            (note.content || "")
            .toLowerCase();

        const tags =
            (note.tags || [])
            .join(" ")
            .toLowerCase();

        return (

            title.includes(query) ||

            content.includes(query) ||

            tags.includes(query)

        );

    });

}

export function saveRecentSearch(query){

    if(!query.trim()) return;

    let searches =
        getRecentSearches();

    searches =
        searches.filter(item=>

            item !== query

        );

    searches.unshift(query);

    searches = searches.slice(0,10);

    localStorage.setItem(

        RECENT_KEY,

        JSON.stringify(searches)

    );

}

export function getRecentSearches(){

    return JSON.parse(

        localStorage.getItem(
            RECENT_KEY
        )

    ) || [];

}

export function clearRecentSearches(){

    localStorage.removeItem(
        RECENT_KEY
    );

}

export function highlight(text,keyword){

    if(!keyword){

        return text;

    }

    const regex =
        new RegExp(
            `(${keyword})`,
            "gi"
        );

    return text.replace(

        regex,

        "<mark>$1</mark>"

    );

}