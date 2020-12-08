const processState = {
  callBackQueue: [],
  mainId: null
}

function CallBackObject(id, priority, callBack) {
  this.id = id;
  this.priority = priority;
  this.callBack = callBack;  
}

export const priorityValues = {
  get LOW() { return 0 },
  get HIGH() { return 1 }
}

export function wrapper(outerHandler, priority = priorityValues.LOW) {
  const id = Symbol("id");
  
  return function innerHandler() {
    const state = processState,
          queue = state.callBackQueue;

    if (null == state.mainId) {
      state.mainId = id;

      outerHandler(...arguments)
        .finally( () => state.mainId = null )
        .then( (result) => {
          if (0 < queue.length) {             
            const callBack = queue.shift().callBack;
            setTimeout(callBack);
          }} )
        .catch( () => queue.shift() );
      return;
    }

    let startIndex;
    if (0 == queue.filter(obj => priorityValues.HIGH != obj.priority).length
    || -1 == ( startIndex = id == state.mainId ? 0 : queue.findIndex(obj => id == obj.id) ) ) {
      queue.push( new CallBackObject(id, priority, innerHandler.bind(this, ...arguments) ));
      
      return;
    }

    queue.splice(
      startIndex,
      queue.length - startIndex,
      ...queue
        .slice(startIndex)
        .filter(obj => priorityValues.HIGH == obj.priority) );
    if (priority == priorityValues.HIGH) {

      queue.push( new CallBackObject(id, priority, innerHandler.bind(this, ...arguments) ));
      
    }
  };
}