module.exports = {
  getTextFromTime: (time, withHours = false) => {
    if (!time) {
      return '-';
    }

    // Else
    let date = new Date(time);
    return date.toLocaleDateString() + (withHours ? " " + date.toLocaleTimeString() : "");
  },

  randomIntFromInterval: (min,max) => {
      return Math.floor(Math.random()*(max-min+1)+min);
  }
}
