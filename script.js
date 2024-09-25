let floorsCount, liftsCount;
let lifts = [];
let liftState = [];
let floors = [];
const floorHeight = 100;
let queue = []; // Single queue for both up and down requests

function initialize() {
  floorsCount = parseInt(document.getElementById('floors').value);
  liftsCount = parseInt(document.getElementById('lifts').value);

  if (floorsCount < 2 || liftsCount < 1 || floorsCount < 0 || liftsCount < 0) {
    alert("Invalid input! The minimum number of floors is 2, and the minimum number of lifts is 1. Please enter valid numbers.");
    return;
  }

  generateBuilding();
  createLifts();
}

function generateBuilding() {
  const building = document.getElementById('building');
  building.innerHTML = '';
  floors = [];

  for (let i = 0; i < floorsCount; i++) {
    const floor = document.createElement('div');
    floor.classList.add('floor');
    floor.style.height = `${floorHeight}px`;
    floor.dataset.floor = i;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    if (i < floorsCount - 1) {
      const upButton = document.createElement('button');
      upButton.innerText = 'Up';
      upButton.classList.add('up', 'button');
      upButton.onclick = () => addToQueue(i, 'up');
      buttonContainer.appendChild(upButton);
    }

    if (i > 0) {
      const downButton = document.createElement('button');
      downButton.innerText = 'Down';
      downButton.classList.add('down', 'button');
      downButton.onclick = () => addToQueue(i, 'down');
      buttonContainer.appendChild(downButton);
    }

    const liftContainer = document.createElement('div');
    liftContainer.classList.add('lift-container');
    floor.appendChild(buttonContainer);
    floor.appendChild(liftContainer);
    building.appendChild(floor);
    floors.push(floor);
  }
}

function createLifts() {
  lifts = [];
  liftState = Array.from({ length: liftsCount }, () => ({
    currentFloor: 0,
    busy: false,
    targetFloor: null,
    direction: null
  }));

  const liftContainer = floors[0].querySelector('.lift-container');

  for (let i = 0; i < liftsCount; i++) {
    const lift = document.createElement('div');
    lift.classList.add('lift');
    lift.dataset.currentFloor = 0;
    lift.dataset.busy = 'false';
    lift.style.left = `${i * 60}px`;

    const leftDoor = document.createElement('div');
    leftDoor.classList.add('door', 'left');
    const rightDoor = document.createElement('div');
    rightDoor.classList.add('door', 'right');
    lift.appendChild(leftDoor);
    lift.appendChild(rightDoor);
    lifts.push(lift);

    liftContainer.appendChild(lift);
  }
}

function addToQueue(floor, direction) {
  const button = document.querySelector(`[data-floor="${floor}"] .${direction}`);
  button.disabled = true;

  // Add the floor and direction to a single queue
  if (!queue.find(req => req.floor === floor && req.direction === direction)) {
    queue.push({ floor, direction });
  }

  processQueue();
}

function processQueue() {
  const idleLifts = lifts.filter((lift, index) => !liftState[index].busy);

  if (idleLifts.length === 0) {
    return;
  }

  if (queue.length > 0) {
    const nextRequest = queue[0];
    if (assignLift(nextRequest.floor, nextRequest.direction)) {
      queue.shift(); // Remove processed request from the queue
    }
  }
}

function assignLift(requestedFloor, direction) {
  let nearestLift = null;
  let minDistance = floorsCount;

  lifts.forEach((lift, index) => {
    const liftData = liftState[index];
    const currentFloor = liftData.currentFloor;
    const distance = Math.abs(currentFloor - requestedFloor);
    const busy = liftData.busy;

    if (!busy && distance < minDistance && !isLiftAlreadyHeadingToFloor(requestedFloor, direction)) {
      nearestLift = lift;
      minDistance = distance;
    }
  });

  if (nearestLift) {
    const liftIndex = lifts.indexOf(nearestLift);
    liftState[liftIndex].direction = direction;
    moveLift(nearestLift, requestedFloor, liftIndex);
    return true;
  }
  return false;
}

function isLiftAlreadyHeadingToFloor(floor, direction) {
  return lifts.some((lift, index) => {
    const liftData = liftState[index];
    return liftData.targetFloor === floor && (liftData.direction === direction || liftData.direction === null);
  });
}

function moveLift(lift, requestedFloor, liftIndex) {
  const liftData = liftState[liftIndex];
  liftData.busy = true;
  liftData.targetFloor = requestedFloor;
  lift.dataset.targetFloor = requestedFloor;

  const currentFloor = liftData.currentFloor;
  const distance = Math.abs(currentFloor - requestedFloor);
  const travelTime = distance * 1;

  lift.style.transition = `transform ${travelTime}s linear`;
  const translateY = -(requestedFloor * floorHeight)- (0.3 * floorHeight);; // Correct calculation based on floor height;
  lift.style.transform = `translateY(${translateY}px)`;

  setTimeout(() => {
    liftData.currentFloor = requestedFloor;
    openDoors(lift, liftIndex);
  }, travelTime * 1000);
}

function openDoors(lift, liftIndex) {
  const [leftDoor, rightDoor] = lift.getElementsByClassName('door');
  leftDoor.style.width = '0%';
  rightDoor.style.width = '0%';

  setTimeout(() => closeDoors(lift, liftIndex), 2500);
}

function closeDoors(lift, liftIndex) {
  const [leftDoor, rightDoor] = lift.getElementsByClassName('door');
  leftDoor.style.width = '50%';
  rightDoor.style.width = '50%';

  setTimeout(() => {
    liftState[liftIndex].busy = false;
    liftState[liftIndex].targetFloor = null;

    // Enable the buttons again after the lift is free
    const currentFloor = liftState[liftIndex].currentFloor;
    const floorElement = document.querySelector(`[data-floor="${currentFloor}"]`);
    const upButton = floorElement.querySelector('.up');
    const downButton = floorElement.querySelector('.down');
    if (upButton) upButton.disabled = false;
    if (downButton) downButton.disabled = false;

    processQueue();
  }, 2500);
}
