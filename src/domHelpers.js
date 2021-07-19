/* eslint-disable import/no-cycle */

import { todo } from './index.js';

export function closestElementToCurrentDrag(tasksContainer, positionY) {
  const possibleElements = [...tasksContainer.querySelectorAll('.task:not(.current-drag)')];
  return possibleElements.reduce((accu, possibleElement) => {
    const dimensions = possibleElement.getBoundingClientRect();
    const offset = positionY - dimensions.top - dimensions.height / 3;
    if (offset < 0 && offset > accu.offset) return { offset, closest: possibleElement };
    return accu;
  }, { offset: Number.NEGATIVE_INFINITY });
}

export function taskTobeSwapped(e) {
  if (e.path[0].nodeName !== 'LI') return e.path[0].parentElement;
  return e.target;
}

export function exchangeElements(parent, element1, element2) {
  const clonedElement1 = element1.cloneNode(true);
  const clonedElement2 = element2.cloneNode(true);
  parent.replaceChild(clonedElement1, element2);
  parent.replaceChild(clonedElement2, element1);
}

export function domAfterReorder(e) {
  const childrenList = [...e.target.parentElement.children];
  return childrenList.map((child) => ({ id: child.id, title: child.querySelector('.form .text-input').value }));
}
function editHandler(e) {
  e.preventDefault();
  const userInput = e.target.value;
  const taskId = todo.storage
    .find((ele) => ele.description === e.target.dataset.currentValue)
    .index;
  if (userInput.trim()) {
    todo.descriptionUpdate(taskId, userInput);
  } else {
    e.target.parentElement.parentElement.remove();
    todo.removeTask(taskId);
  }
  e.target.dataset.currentValue = userInput;
}
export function removeAllCompletedHandler() {
  const completedTasks = todo.allCompleted();
  completedTasks.forEach((task) => {
    document.querySelector(`[data-current-value= "${task.description}"]`)
      .parentElement
      .parentElement
      .remove();
    todo.removeTask(task.index);
  });
}
export function emptyTaskComponent(task, obj) {
  const fragment = document.createDocumentFragment();
  const listItem = document.createElement('li');
  listItem.classList.add('task');
  listItem.setAttribute('draggable', 'true');
  listItem.id = task.index;

  // create a checkbox and add eventLis to it
  const taskStatusCheckbox = document.createElement('input');
  taskStatusCheckbox.classList.add('task-status');
  taskStatusCheckbox.type = 'checkbox';
  if (task.completed) taskStatusCheckbox.setAttribute('checked', true);
  listItem.appendChild(taskStatusCheckbox);
  listItem.addEventListener('dragstart', () => {
    listItem.classList.add('current-drag');
  });
  listItem.addEventListener('dragend', (e) => {
    listItem.classList.remove('current-drag');
    obj.updateIndex(domAfterReorder(e));
  });

  listItem.innerHTML += `

      <div action="" class='form' name='add_task'>
          <input class='text-input' type="text" name='task_description' value='${task.description}' data-current-value='${task.description}' >
      </div>
      <span class="icon-move">
        <i class="icon fas fa-ellipsis-v"></i>
      </span>
  `;

  fragment.append(listItem);

  listItem.querySelector('.task-status').addEventListener('change', () => {
    const { index } = task;
    obj.statusUpdate(index);
  });

  listItem.querySelector('.text-input').addEventListener('focus', (event) => {
    const statusCheckbox = event.target.parentElement.previousElementSibling;
    event.target.parentElement.parentElement.classList.add('onFocus');
    event.target.classList.add('onFocus-input');
    if (statusCheckbox.checked) { statusCheckbox.checked = false; }
  });

  listItem.querySelector('.text-input').addEventListener('focusout', (event) => {
    event.target.parentElement.parentElement.classList.remove('onFocus');
    event.target.classList.remove('onFocus-input');
    if (task.completed === true) event.target.parentElement.previousElementSibling.checked = true;
  });

  listItem.querySelector('.text-input').addEventListener('change', editHandler);

  return fragment;
}
export function displayTasks(obj) {
  const fragment = document.createDocumentFragment();

  obj.storage
    .forEach((task) => {
      const listItem = emptyTaskComponent(task, obj);
      fragment.append(listItem);
    });
  return fragment;
}

export function addTaskFirstClassFunc(ele, todoObj) {
  const tasksWrapper = document.querySelector('.list-wrapper');

  ele.addEventListener('submit', (event) => {
    event.preventDefault();
    const { task_description: addTaskInput } = event.target.elements;
    const userInput = addTaskInput.value;
    addTaskInput.value = '';
    if (userInput.trim()) {
      const task = todoObj.addTask({ description: userInput });
      tasksWrapper.appendChild(emptyTaskComponent(task, todoObj));
    }
  });
}
