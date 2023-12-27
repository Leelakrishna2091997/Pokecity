To run this repo, follow the same instructions for running the project starter code. 

## Running this app locally

Running the application locally entails running both the backend service and a frontend.

### Setting up the backend

To run the backend, you will need a Twilio account. Twilio provides new accounts with $15 of credit, which is more than enough to get started.
To create an account and configure your local environment:

1. Go to [Twilio](https://www.twilio.com/) and create an account. You do not need to provide a credit card to create a trial account.
2. Create an API key and secret (select "API Keys" on the left under "Settings")
3. Create a `.env` file in the `townService` directory, setting the values as follows:

| Config Value            | Description                               |
| ----------------------- | ----------------------------------------- |
| `TWILIO_ACCOUNT_SID`    | Visible on your twilio account dashboard. |
| `TWILIO_API_KEY_SID`    | The SID of the new API key you created.   |
| `TWILIO_API_KEY_SECRET` | The secret for the API key you created.   |
| `TWILIO_API_AUTH_TOKEN` | Visible on your twilio account dashboard. |

### Starting the backend

Once your backend is configured, you can start it by running `npm start` in the `townService` directory (the first time you run it, you will also need to run `npm install`).
The backend will automatically restart if you change any of the files in the `townService/src` directory.

### Configuring the frontend

Create a `.env` file in the `frontend` directory, with the line: `NEXT_PUBLIC_TOWNS_SERVICE_URL=http://localhost:8081` (if you deploy the towns service to another location, put that location here instead)

For ease of debugging, you might also set the environmental variable `NEXT_PUBLIC_TOWN_DEV_MODE=true`. When set to `true`, the frontend will
automatically connect to the town with the friendly name "DEBUG_TOWN" (creating one if needed), and will *not* try to connect to the Twilio API. This is useful if you want to quickly test changes to the frontend (reloading the page and re-acquiring video devices can be much slower than re-loading without Twilio).

### Running the frontend

In the `frontend` directory, run `npm run dev` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally.
The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory.

### PokeTown Overview

We brought a new form of entertainment to Covey.Town: Pokemon! Our implementation included features from various Pokemon Games to introduce a new form of community and competitive spirit.

Our feature brings a tall grass interactable area to find and catch unknown Pokemon. When the user walks in the tall grass interactable area, each step taken has a chance of encountering a random Pokemon. If a Pokemon decides to appear, a modal will appear in front of the user.

The user has the option to throw a Pokeball to have a chance to catch and keep the Pokemon, or they have the choice to run away from the Pokemon and return to Covey.Town. If the user decides to try catching the Pokemon, they’ll have three opportunities to stop the slider inside the green zone. The user must click the spacebar to stop the slider or throw the Pokeball. The size of the green zone is based on predetermined catch rate data from PokeAPI. The harder it is to catch a Pokemon, the smaller the green zone (shown above). On top of this, if the Pokemon is predetermined to be a “faster” Pokemon (also based on data from PokeAPI), the slider will also move faster, making it harder for the user to stop the slider in the green zone. 

If the user successfully stops the slider within the green zone, the user will throw a Pokeball to catch the Pokemon. However, there is still a chance that the Pokemon will escape the Pokeball. The user can attempt to capture the Pokemon again if they have not missed three times. Suppose the user fails to catch the Pokemon after three tries. In that case, the Pokemon will run away and the “Run Away” button becomes a “Leave” button so the user can exit the capture modal.


Once the user catches their first Pokemon, their Pokemon will follow them around Covey.Town. Depending on the direction the user is walking, the Pokemon sprite will update to match their direction. 

Users can catch and hold more than one Pokemon in their Pokemon Bag. To access the Pokemon Bag, the user clicks the “p” key. A modal will appear that shows a list of all their captured Pokemon. This data is locally stored so that users can persist their Pokemon between sessions. The user can choose one of their Pokemon to follow them around by simply clicking on the desired Pokemon within the modal. Other users will be able to see your Pokemon following you around and if you change your Pokemon to another one (seen below). If the user decides that they want to put their Pokemon away, they have the option to click “No Pokemon.”



Finally, users can battle other users' Pokemon. Users can request to battle another player and their Pokemon if the other player is nearby. If the other user accepts the battle, the battle is simulated, and one Pokemon is determined to win. The battle's winner is simulated based on the Pokemon attributes and factors of randomness.

