const DB_NAME = "SerenotesDB";

const STORE_NAME = "media";

const VERSION = 1;

let dbInstance = null;

function openDB(){

    if(dbInstance){

        return Promise.resolve(dbInstance);

    }

    return new Promise((resolve,reject)=>{

        const request =
            indexedDB.open(DB_NAME,VERSION);

        request.onupgradeneeded = ()=>{

            const db = request.result;

            if(
                !db.objectStoreNames.contains(STORE_NAME)
            ){

                db.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath:"id"
                    }
                );

            }

        };

        request.onsuccess = () => {

            dbInstance = request.result;

            resolve(dbInstance);

        };

        request.onerror=()=>{

            reject(request.error);

        };

    });

}

export async function uploadMedia(file){

    if (!file) {

        throw new Error("No media selected.");

    }

    const MAX_SIZE = 50 * 1024 * 1024;

    if(file.size > MAX_SIZE) {

        throw new Error("File size exceeds 50 MB.");

    }

    // FIX: Removed dead `valid` variable; isSupportedMedia check is the single validation
    if(!isSupportedMedia(file)){

        throw new Error(
            "Unsupported media type."
        );

    }

    const db = await openDB();

    const id = crypto.randomUUID();

    return new Promise((resolve,reject)=>{

        const tx =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        tx.objectStore(STORE_NAME)
        .put({

            id,

            file,

            filename: file.name,

            mimeType: file.type,

            size: file.size,

            createdAt: new Date().toISOString(),

            updatedAt: new Date().toISOString()

        });

        tx.oncomplete = () => {

            resolve({

                id,

                filename: file.name,

                size: file.size,

                mimeType: file.type,

                type: getMediaType(file.type),

                refId: id

            });

        };

        tx.onerror = () => {

            reject(tx.error);

        };

    });

}

export async function getMedia(refId){

    const db = await openDB();

    return new Promise((resolve,reject)=>{

        const tx =
            db.transaction(
                STORE_NAME,
                "readonly"
            );

        const request =
            tx.objectStore(STORE_NAME)
            .get(refId);

        request.onsuccess = () => {

            resolve(request.result);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}

export async function deleteMedia(refId){

    const db = await openDB();

    return new Promise((resolve,reject)=>{

        const tx =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        tx.objectStore(STORE_NAME)
        .delete(refId);

        tx.oncomplete = () => {

            resolve();

        };

        tx.onerror = () => {

            reject(tx.error);

        };

    });

}

function getMediaType(mimeType) {

    if (mimeType.startsWith("image/")) {

        if (mimeType === "image/gif") {

            return "gif";

        }

        return "photo";

    }

    if (mimeType.startsWith("video/")) {

        return "video";

    }

    if (mimeType.startsWith("audio/")) {

        return "voice";

    }

    return "file";

}

export async function getAllMedia() {

    const db = await openDB();

    return new Promise((resolve, reject) => {

        const tx = db.transaction(
            STORE_NAME,
            "readonly"
        );

        const request = tx.objectStore(STORE_NAME)
            .getAll();

        request.onsuccess = () => {

            resolve(request.result);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}

export function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }

    if (bytes < 1024 * 1024) {

        return (bytes / 1024).toFixed(1) + " KB";

    }

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";

}

export async function clearMedia() {

    const db = await openDB();

    return new Promise((resolve,reject)=>{

        const tx = db.transaction(

            STORE_NAME,

            "readwrite"

        );

        tx.objectStore(STORE_NAME).clear();

        tx.oncomplete = ()=>{

            resolve();

        };

        tx.onerror = ()=>{

            reject(tx.error);

        };

    });

}

export async function getStorageUsage(){

    const media = await getAllMedia();

    return media.reduce(

        (total,item)=>total+item.size,

        0

    );

}

export function getMediaURL(media){

    if(!media) return null;

    return URL.createObjectURL(media.file);

}

export function revokeMediaURL(url){

    if(url){

        URL.revokeObjectURL(url);

    }

}

export function isSupportedMedia(file){

    if(!file) return false;

    const allowed=[

        "image/",

        "video/",

        "audio/"

    ];

    return allowed.some(type=>

        file.type.startsWith(type)

    ) || file.type==="image/gif";

}
