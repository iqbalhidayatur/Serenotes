import {
    getAllNotes,
    getNoteById,
    saveUpdatedNote
} from "./noteService.js";

export function createReminder(

    datetime

){

    return {

        enabled: true,

        datetime,

        completed: false,

        notified: false,

        createdAt: new Date().toISOString()

    };

}

export function removeReminder(noteId){

    // FIX: getNoteById now properly imported from noteService
    const note = getNoteById(noteId);

    if(!note){

        return false;

    }

    note.reminder = {

        enabled: false,

        datetime: "",

        completed: false,

        notified: false,

        createdAt: ""

    };

    // FIX: removed duplicate semicolon
    saveUpdatedNote(note);

    return true;

}

export function completeReminder(noteId){

    const note = getNoteById(noteId);

    if(!note){

        return false;

    }

    note.reminder.completed = true;

    saveUpdatedNote(note);

    return true;

}

export function markAsNotified(noteId){

    const note = getNoteById(noteId);

    if(!note){

        return false;

    }

    note.reminder.notified = true;

    saveUpdatedNote(note);

    return true;

}

export function getTodayReminders(){

    const today = new Date();

    return getAllNotes().filter(note=>{

        if(!note.reminder?.enabled){

            return false;

        }

        const reminder = new Date(
            note.reminder.datetime
        );

        return (

            reminder.getFullYear() === today.getFullYear() &&

            reminder.getMonth() === today.getMonth() &&

            reminder.getDate() === today.getDate() &&

            !note.reminder.completed

        );

    });

}

export function getUpcomingReminders(){

    const now = new Date();

    return getAllNotes().filter(note=>{

        if(!note.reminder?.enabled){

            return false;

        }

        return (

            new Date(note.reminder.datetime) > now &&

            !note.reminder.completed

        );

    });

}

export function getOverdueReminders(){

    const now = new Date();

    return getAllNotes().filter(note=>{

        if(!note.reminder?.enabled){

            return false;

        }

        return (

            new Date(note.reminder.datetime) < now &&

            !note.reminder.completed

        );

    });

}

export function getCompletedReminders(){

    return getAllNotes().filter(note=>

        note.reminder?.completed

    );

}

export function getNextReminder(){

    const reminders = getUpcomingReminders()

        .sort(

            (a,b)=>

                new Date(a.reminder.datetime) -

                new Date(b.reminder.datetime)

        );

    return reminders[0] || null;

}

export function getReminderStats(){

    return {

        today: getTodayReminders().length,

        upcoming: getUpcomingReminders().length,

        overdue: getOverdueReminders().length,

        completed: getCompletedReminders().length

    };

}
