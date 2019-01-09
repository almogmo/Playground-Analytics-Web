import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { Grid, Col, Row } from 'react-bootstrap';
import Select from 'react-select';
import firebase from 'firebase/app';
import 'firebase/database';
import { getTextFromTime, randomIntFromInterval } from './Utils/Utils';
import './App.css';

// Initialize Firebase
const config = {
  apiKey: "AIzaSyAnjqGumukcPxw1sROiLqONBHlOJ0UB2uU",
  authDomain: "couting-people-project.firebaseapp.com",
  databaseURL: "https://couting-people-project.firebaseio.com",
  projectId: "couting-people-project",
  storageBucket: "couting-people-project.appspot.com",
  messagingSenderId: "1077736810841"
};
firebase.initializeApp(config);

const db = firebase.database();

const datasetProperties = {
  label: 'Visitors',
  fill: false,
  lineTension: 0.1,
  backgroundColor: 'rgba(75,192,192,0.4)',
  borderColor: 'rgba(75,192,192,1)',
  pointBorderColor: 'rgba(75,192,192,1)',
  pointBackgroundColor: '#fff',
  pointHoverBackgroundColor: 'rgba(75,192,192,1)',
  pointHoverBorderColor: 'rgba(220,220,220,1)',
  pointHoverBorderWidth: 0,
};

const selectOptions = [
  { value: 'last14d', label: 'Last 14 Days' },
  { value: 'last7d', label: 'Last 7 Days' },
  { value: 'last72h', label: 'Last 72 Hours' },
  { value: 'last24h', label: 'Last 24 Hours' }
];

let visitorsGraphData = {
  datasets: [
    datasetProperties
  ],
};

let playgroundRef = db.ref('playground-selina1');

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      visitorsGraphData,
      last: {
        visitors: '-'
      },
      selectedOption: selectOptions[1]
    }
  }

  componentDidMount() {
    // this.mockDataPush();
    let _this = this;

    let now = Date.now();

    // Last 7 days as default
    this.populateData(now - (1000*60*60*24*7), _this);

    playgroundRef.limitToLast(1).on('child_added', (function (snapshot) {
      _this.setState({
        last: snapshot.val()
      })
    }));
  }

  mockDataPush() {
    let currentTime = 1544832000000;
    // let currentTime = 1545807300000;
    let previousVisitors = 150;

    while (currentTime < Date.now()) {
      let randomVisitors = Math.max(0, randomIntFromInterval(previousVisitors+6, previousVisitors-6));
      previousVisitors = randomVisitors;
      currentTime += 300000; // 5 minutes per event
      let event = {
        time: currentTime,
        visitors: randomVisitors,
      }

      playgroundRef.push(event);
    }
  }

  populateData(startingTime, _this) {
    playgroundRef.orderByChild('time').startAt(startingTime).once('value').then(function (snapshot) {
      let data = snapshot.val();
      let dataForGraph = [];
      let labels = [];

      for (let event in data) {
        let current = data[event];
        if (current) {
          let time = current.time;
          let visitors = current.visitors;
          labels.push(getTextFromTime(time, true));
          dataForGraph.push(visitors);
        }
      }

      visitorsGraphData.datasets[0].data = dataForGraph;
      visitorsGraphData.labels = labels;

      _this.setState({
        visitorsGraphData
      });
    });
  }

  handleChange(selectedOption) {
    if (this.state.selectedOption === selectedOption) {
      // Same option - Ignore.
      return;
    }
    this.setState({ selectedOption });
    let timeDiff = 0;
    switch (selectedOption.value) {
      case 'last14d':
        timeDiff = 1000*60*60*24*14;
        break;
      case 'last72h':
        timeDiff = 1000*60*60*24*3;
        break;
      case 'last24h':
        timeDiff = 1000*60*60*24*1;
        break;
      case 'last7d':
      default:
        timeDiff = 1000*60*60*24*7;
        break;
    }
    this.populateData(Date.now() - timeDiff, this);
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <div className="Current-Visitors-Box">
              <p>
                Currently Visiting
              </p>
              <p>
                {this.state.last.visitors}
              </p>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={8} />
          <Col md={4}>
            <Select
              value={this.state.selectedOption}
              onChange={this.handleChange.bind(this)}
              options={selectOptions}
            />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Line
              options={{
                elements: { point: { radius: 0 } },
              }}
              data={this.state.visitorsGraphData}
            />
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default App;
