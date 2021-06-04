import React, { Component } from 'react';
import './App.css';
import _ from "lodash";
import './styles.scss';
import { Grid, Card,CardContent } from "@material-ui/core";


const load = (callback) => {
  window.gapi.client.load("sheets", "v4", () => {
    window.gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: process.env.REACT_APP_SPREADSHEET_ID,
        range: `${process.env.REACT_APP_SHEET_ID}!A2:E`
      })
      .then(
        response => {
          const data = response.result.values;
          const items = data.map(item => ({
            name: item[0],
            location: item[1],
            address: item[2],
            price_range: item[3],
            type: item[4],
          })) || [];
          callback({
            items
          });
        },
        response => {
          callback(false, response.result.error);
        }
      );
  });
}
const loadLocations = (callback) => {
  window.gapi.client.load("sheets", "v4", () => {
    window.gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: process.env.REACT_APP_SPREADSHEET_ID,
        range: `${process.env.REACT_APP_SHEET_LOC}!A2:B`
      })
      .then(
        response => {
          const data = response.result.values;
          const items = data.map(item => ({
            zh_name: item[0]
          })) || [];
          callback({
            items
          });
        },
        response => {
          callback(false, response.result.error);
        }
      );
  });
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      locations:[],
      result: null,
      selected: "",
      loading: true
    }
  }

  componentWillMount() {

  }

  componentDidMount() {
    window.gapi.load("client", this.initClient);
  }

  initClient = () => {
    window.gapi.client.init({
      apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
      discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
    }).then(()=>{
      load(this.onLoad);
      loadLocations(this.onLoadLocation);
    })
  }

  onLoad = (data,error) => {
    if (data) {
      this.setState(prevState => ({
        items: data.items
      }))
    }
  }

  onLoadLocation = (data,error) => {
    if (data) {
      this.setState(prevState => ({
        locations: data.items
      }))
    }
  }

  onRandom = () => {
    const location = this.state.selected;
    const items = (location !== "" && location !== undefined) ? _.filter(this.state.items, {location: location}) : this.state.items;
    const random = Math.floor(Math.random()*items.length);
    const result = _.get(items,`[${random}]`,null);
    this.setState(prevState=>({
      ...prevState,
      result:result
    }))
  }

  render() {
    const randomResult = this.state.result;
    return (
      <div className="App">
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item md={4} xs={8}>
            <Card>
              <CardContent>
                <Grid
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
                >
                  <Grid item xs={4}>
                    <Grid
                      container
                      direction="row"
                    >
                      <Grid item xs={12}>搵食地區 (Location):</Grid>
                      <Grid item xs={12}>
                        <select onChange={(e)=>{
                          this.setState(prevState=>({
                            ...prevState,
                            selected: e.target.value
                          }))
                          
                        }}>
                          <option>-- Please Select --</option>
                          { (this.state.locations != null) && this.state.locations.map((v)=> { return(<option value={v.zh_name}>{v.zh_name}</option>); }) }
                        </select>
                      </Grid>
                      <Grid item xs={12}>
                        <button onClick={(e)=>{this.onRandom()}}>Random</button>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={8}>
                    <Grid
                      container
                      direction="row"
                    >
                      <Grid item xs={4}>餐廳 (Restaurant):</Grid><Grid item xs={8}>{`${_.get(randomResult,"name","無紀錄")}`}</Grid>
                      <Grid item xs={4}>地址 (Address):</Grid><Grid item xs={8}>{`${_.get(randomResult,"address","無紀錄")}`}</Grid>
                      <Grid item xs={4}>種類 (Type):</Grid><Grid item xs={8}>{`${_.get(randomResult,"type","無紀錄")}`}</Grid>
                      <Grid item xs={4}>價格範圍 / 每人 (Price Range / Per Person):</Grid><Grid item xs={8}>{`${_.get(randomResult,"price_range","無紀錄")}`}</Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    ); 
  }
}