import {
    getAllNotes
} from "./noteService.js";

const RECENT_KEY =
    "serenotes_recent_searches";

export function search(query) {

    if (!query) return [];

    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/);

    const scored = getAllNotes().map(note => {

        const title   = (note.title || "").toLowerCase();
        const content = (note.blocks || [])
            .map(b => (b.text || "").replace(/<[^>]+>/g, ""))
            .join(" ")
            .toLowerCase();
        const tags    = (note.tags || []).join(" ").toLowerCase();
        const cat     = (note.category || "").toLowerCase();

        let score = 0;

        terms.forEach(term => {

            // Title — bobot tertinggi
            if (title === term)          score += 100; // exact match
            if (title.startsWith(term))  score += 60;
            if (title.includes(term))    score += 40;

            // Tag — bobot tinggi
            if (tags.split(" ").includes(term)) score += 50;
            else if (tags.includes(term))        score += 30;

            // Category
            if (cat.includes(term)) score += 20;

            // Content — bobot rendah
            const occurrences = (content.match(new RegExp(term, "g")) || []).length;
            score += occurrences * 5;

        });

        return { note, score };

    });

    return scored
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.note);

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