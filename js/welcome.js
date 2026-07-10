// StageCue Welcome Screen

export class WelcomeScreen {

    constructor() {

        this.create();

    }

    create() {

        document.body.insertAdjacentHTML("beforeend",`

<div id="welcomeModal" class="welcome-modal">

    <div class="welcome-card">

        <div class="logo">
            🎬
        </div>

        <h1>StageCue</h1>

        <p>
            Professional playback for live productions.
        </p>

        <div class="actions">

            <button id="welcomeNew">
                ✨ New Project
            </button>

            <button id="welcomeOpen">
                📂 Open Project
            </button>

        </div>

    </div>

</div>

`);

    }

    hide(){

        document
            .getElementById("welcomeModal")
            ?.remove();

    }

}
