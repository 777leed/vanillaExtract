export class Space {
  constructor(id, date, name, thoughtList = [], db) {
    this.id = id;
    this.date = date;
    this.name = name;
    this.thoughtList = thoughtList;
    this.db = db;
  }

  async addThought(thought) {
    this.thoughtList.push(thought);
    await this.save();
  }

  async removeThought(thoughtId) {
    this.thoughtList = this.thoughtList.filter(thought => thought.id !== thoughtId);
    await this.save();
  }

  async updateThought(thoughtId, updatedThought) {
    const index = this.thoughtList.findIndex(thought => thought.id === thoughtId);
    if (index !== -1) {
      this.thoughtList[index] = updatedThought;
      await this.save();
    }
  }

  async clearThoughts() {
    this.thoughtList = [];
    await this.save();
  }

  getThoughtsCount() {
    return this.thoughtList.length;
  }

  filterThoughts(predicate) {
    return this.thoughtList.filter(predicate);
  }

  async save() {
    const transaction = this.db.transaction(['spaces'], 'readwrite');
    const objectStore = transaction.objectStore('spaces');

    await new Promise((resolve, reject) => {
      const request = objectStore.put({
        id: this.id,
        date: this.date,
        name: this.name,
        thoughtList: this.thoughtList
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async load() {
    const transaction = this.db.transaction(['spaces'], 'readonly');
    const objectStore = transaction.objectStore('spaces');

    const request = objectStore.get(this.id);
    await new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('inside success');
        console.log(this.id)
        const data = request.result;
        if (data) {
          this.date = data.date;
          this.name = data.name;
          this.thoughtList = data.thoughtList;
          console.log(this.name);
          console.log(this.thoughtList);

        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }



  async deleteSpace() {
    const transaction = this.db.transaction(['spaces'], 'readwrite');
    const objectStore = transaction.objectStore('spaces');
  
    const deleteRequest = objectStore.delete(this.id);
  
    return new Promise((resolve, reject) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }
  
}
