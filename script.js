
<script>

/* =====================================================
   INDEXEDDB DATABASE
   Stores uploaded score photos in the browser
===================================================== */

const DB_NAME = "JohnDavidAcademicPortfolio";
const DB_VERSION = 1;
const STORE_NAME = "scorePhotos";

let database;


/* =====================================================
   OPEN DATABASE
===================================================== */

function openDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = function(event) {

            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {

                db.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

            }

        };

        request.onsuccess = function(event) {

            database = event.target.result;

            resolve(database);

        };

        request.onerror = function() {

            reject(request.error);

        };

    });

}


/* =====================================================
   CONVERT IMAGE TO DATA URL
===================================================== */

function imageToDataURL(src) {

    return Promise.resolve(src);

}


/* =====================================================
   GET ALL SAVED PHOTOS
===================================================== */

function getSavedPhotos() {

    return new Promise((resolve, reject) => {

        const transaction =
            database.transaction(
                STORE_NAME,
                "readonly"
            );

        const store =
            transaction.objectStore(STORE_NAME);

        const request =
            store.getAll();

        request.onsuccess = function() {

            resolve(request.result);

        };

        request.onerror = function() {

            reject(request.error);

        };

    });

}


/* =====================================================
   DELETE ALL STORED PHOTOS
===================================================== */

function clearDatabase() {

    return new Promise((resolve, reject) => {

        const transaction =
            database.transaction(
                STORE_NAME,
                "readwrite"
            );

        const store =
            transaction.objectStore(STORE_NAME);

        const request =
            store.clear();

        request.onsuccess = function() {

            resolve();

        };

        request.onerror = function() {

            reject(request.error);

        };

    });

}


/* =====================================================
   SAVE ALL PHOTOS
===================================================== */

async function saveAllPhotos() {

    const saveButton =
        document.getElementById("saveAllBtn");

    const status =
        document.getElementById("saveStatus");

    saveButton.disabled = true;

    saveButton.innerHTML =
        "⏳ Saving Photos...";

    status.textContent = "";

    try {

        await clearDatabase();

        const categories = [

            {
                name: "quiz",
                gallery: "quiz-gallery"
            },

            {
                name: "longquiz",
                gallery: "longquiz-gallery"
            },

            {
                name: "midterm",
                gallery: "midterm-gallery"
            },

            {
                name: "final",
                gallery: "final-gallery"
            },

            {
                name: "laboratory",
                gallery: "laboratory-gallery"
            },

            {
                name: "project",
                gallery: "project-gallery"
            }

        ];


        let totalPhotos = 0;


        for (const category of categories) {

            const gallery =
                document.getElementById(
                    category.gallery
                );

            const images =
                gallery.querySelectorAll(
                    ".photo-item img"
                );


            for (const image of images) {

                const transaction =
                    database.transaction(
                        STORE_NAME,
                        "readwrite"
                    );

                const store =
                    transaction.objectStore(
                        STORE_NAME
                    );


                store.add({

                    category: category.name,

                    image: image.src,

                    savedAt:
                        new Date().toISOString()

                });


                totalPhotos++;

            }

        }


        /* Wait a moment for IndexedDB transactions */

        await new Promise(resolve =>
            setTimeout(resolve, 300)
        );


        status.textContent =
            "✓ " +
            totalPhotos +
            " photo" +
            (totalPhotos === 1 ? "" : "s") +
            " saved successfully!";


        saveButton.innerHTML =
            "✓ Photos Saved";


        setTimeout(() => {

            saveButton.innerHTML =
                "💾 Save All Photos";

            saveButton.disabled = false;

        }, 2000);


    } catch (error) {

        console.error(error);

        status.textContent =
            "⚠ Unable to save the photos.";

        saveButton.innerHTML =
            "💾 Save All Photos";

        saveButton.disabled = false;

    }

}


/* =====================================================
   CREATE PHOTO ELEMENT
===================================================== */

function createPhotoElement(
    gallery,
    count,
    imageSource
) {

    const emptyMessage =
        gallery.querySelector(
            ".empty-message"
        );

    if (emptyMessage) {
        emptyMessage.remove();
    }


    const photoItem =
        document.createElement("div");

    photoItem.className =
        "photo-item";


    const image =
        document.createElement("img");

    image.src =
        imageSource;

    image.alt =
        "Academic Score";


    const removeButton =
        document.createElement("button");

    removeButton.className =
        "remove-btn";

    removeButton.innerHTML =
        "×";

    removeButton.title =
        "Remove Photo";


    removeButton.addEventListener(
        "click",
        function() {

            photoItem.remove();

            updatePhotoCount(
                gallery,
                count
            );

        }
    );


    photoItem.appendChild(image);

    photoItem.appendChild(removeButton);

    gallery.appendChild(photoItem);


    updatePhotoCount(
        gallery,
        count
    );

}


/* =====================================================
   SETUP PHOTO UPLOAD
===================================================== */

function setupScoreUpload(
    inputId,
    galleryId,
    countId
) {

    const input =
        document.getElementById(inputId);

    const gallery =
        document.getElementById(galleryId);

    const count =
        document.getElementById(countId);


    input.addEventListener(
        "change",
        function(event) {

            const files =
                Array.from(
                    event.target.files
                );


            files.forEach(function(file) {

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    return;

                }


                const reader =
                    new FileReader();


                reader.onload =
                    function(e) {

                        createPhotoElement(
                            gallery,
                            count,
                            e.target.result
                        );

                    };


                reader.readAsDataURL(file);

            });


            input.value = "";

        }
    );

}


/* =====================================================
   UPDATE PHOTO COUNT
===================================================== */

function updatePhotoCount(
    gallery,
    count
) {

    const photos =
        gallery.querySelectorAll(
            ".photo-item"
        );


    const total =
        photos.length;


    count.textContent =
        total +
        (
            total === 1
                ? " Photo"
                : " Photos"
        );


    if (total === 0) {

        if (
            !gallery.querySelector(
                ".empty-message"
            )
        ) {

            const message =
                document.createElement(
                    "div"
                );

            message.className =
                "empty-message";

            message.textContent =
                "No score photos yet.";

            gallery.appendChild(
                message
            );

        }

    }

}


/* =====================================================
   LOAD SAVED PHOTOS WHEN PAGE OPENS
===================================================== */

async function loadSavedPhotos() {

    try {

        const savedPhotos =
            await getSavedPhotos();


        savedPhotos.forEach(
            function(photo) {

                let galleryId;
                let countId;


                switch (photo.category) {

                    case "quiz":
                        galleryId =
                            "quiz-gallery";
                        countId =
                            "quiz-count";
                        break;

                    case "longquiz":
                        galleryId =
                            "longquiz-gallery";
                        countId =
                            "longquiz-count";
                        break;

                    case "midterm":
                        galleryId =
                            "midterm-gallery";
                        countId =
                            "midterm-count";
                        break;

                    case "final":
                        galleryId =
                            "final-gallery";
                        countId =
                            "final-count";
                        break;

                    case "laboratory":
                        galleryId =
                            "laboratory-gallery";
                        countId =
                            "laboratory-count";
                        break;

                    case "project":
                        galleryId =
                            "project-gallery";
                        countId =
                            "project-count";
                        break;

                }


                if (
                    galleryId &&
                    countId
                ) {

                    createPhotoElement(

                        document.getElementById(
                            galleryId
                        ),

                        document.getElementById(
                            countId
                        ),

                        photo.image

                    );

                }

            }
        );


        if (savedPhotos.length > 0) {

            document.getElementById(
                "saveStatus"
            ).textContent =
                "✓ Saved photos loaded automatically.";

        }


    } catch (error) {

        console.error(
            "Could not load saved photos:",
            error
        );

    }

}


/* =====================================================
   SETUP ALL SCORE CATEGORIES
===================================================== */

setupScoreUpload(
    "quiz-input",
    "quiz-gallery",
    "quiz-count"
);

setupScoreUpload(
    "longquiz-input",
    "longquiz-gallery",
    "longquiz-count"
);

setupScoreUpload(
    "midterm-input",
    "midterm-gallery",
    "midterm-count"
);

setupScoreUpload(
    "final-input",
    "final-gallery",
    "final-count"
);

setupScoreUpload(
    "laboratory-input",
    "laboratory-gallery",
    "laboratory-count"
);

setupScoreUpload(
    "project-input",
    "project-gallery",
    "project-count"
);


/* =====================================================
   SAVE BUTTON
===================================================== */

document
    .getElementById("saveAllBtn")
    .addEventListener(
        "click",
        saveAllPhotos
    );


/* =====================================================
   CURRENT YEAR
===================================================== */

document.getElementById(
    "year"
).textContent =
    new Date().getFullYear();


/* =====================================================
   START DATABASE AND LOAD SAVED PHOTOS
===================================================== */

(async function() {

    try {

        await openDatabase();

        await loadSavedPhotos();

    } catch (error) {

        console.error(
            "Database error:",
            error
        );

        document.getElementById(
            "saveStatus"
        ).textContent =
            "⚠ Your browser does not support saved photo storage.";

    }

})();

</script>

</body>
</html>


