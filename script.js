'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* DOM ELEMENTS */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* APP CLASSES  */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cyc1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cyc1);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* APP ARCHITECTURE */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Map initialization
    this._getPosition();

    // Event handlers
    inputType.addEventListener('change', this._toggleElevationField);
    form.addEventListener('submit', this._newWorkout.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), err =>
        alert(`An error has ocurred: ${err}`)
      );
    }
  }

  _loadMap(position) {
    // Get coords
    const { latitude, longitude } = position.coords;

    // Create and display the map
    this.#map = L.map('map').setView([latitude, longitude], 13);
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handle the 'click' event on the map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField(e) {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    // Check if all inputs are numbers
    const validInputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));

    // Check if all inputs are positive
    const allPositive = (...inputs) => inputs.every(input => input > 0);

    // Get data
    const type = inputType.value;
    const distance = +inputDistance.value; // Parse to Number with '+'
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout running, create Running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Validate data
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers.');

      // Create the Running object
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create Cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // Validate data
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers.');

      // Create the Running object
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new workout to the workouts array
    this.#workouts.push(workout);
    console.log(workout);

    // Render workout on the map
    this._renderWorkoutMarket(workout);

    // Render workout on the list

    // Clear fields
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }

  _renderWorkoutMarket(workout) {
    console.log();
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        }).setContent('Workout :D!')
      )
      .openPopup();
  }
}

const app = new App();
