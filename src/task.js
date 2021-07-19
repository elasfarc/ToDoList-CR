export default class Task {
  constructor({ index, description, completed = false }) {
    this.description = description;
    this.completed = completed;
    this.index = index;
  }
}
