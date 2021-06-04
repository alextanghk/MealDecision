import React, { Component } from 'react';
import './App.css';
import _ from "lodash";
import './styles.scss';
import { Grid, Card,CardContent, Checkbox , FormControlLabel } from "@material-ui/core";
import Loader from './components/Loader';

const loadRestaurants = (callback) => {
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
            tags: _.get(item,"[4]","").split(";"),
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
const loadTags = (callback) => {
  window.gapi.client.load("sheets", "v4", () => {
    window.gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: process.env.REACT_APP_SPREADSHEET_ID,
        range: `${process.env.REACT_APP_SHEET_TAGS}!A2:B`
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
      tags:[],
      result: null,
      selected: "",
      selectedTags: [],
      loadingLocations: true,
      loadingRestaurants: true,
      loadingTags: true,
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
      loadRestaurants(this.onLoadRestaurants);
      loadLocations(this.onLoadLocation);
      loadTags(this.onLoadTag);
    })
  }

  onLoadRestaurants = (data,error) => {
    if (data) {
      this.setState(prevState => ({
        items: data.items,
        loadingRestaurants:false
      }))
    } else {
      this.setState(prevState => ({
        loadingRestaurants:false
      }))
    }
  }

  onLoadLocation = (data,error) => {
    if (data) {
      this.setState(prevState => ({
        locations: data.items,
        loadingLocations:false
      }))
    } else {
      this.setState(prevState => ({
        loadingLocations:false
      }))
    }
  }

  onLoadTag = (data,error) => {
    if (data) {
      this.setState(prevState => ({
        tags: data.items,
        loadingTags:false
      }))
    } else {
      this.setState(prevState => ({
        loadingTags:false
      }))
    }
  }

  onRandom = () => {
    const location = this.state.selected;
    const tags = this.state.selectedTags;
    const filterByLocation = (location !== "" && location !== undefined) ? _.filter(this.state.items, {location: location}) : this.state.items;
    console.log(tags);
    console.log(filterByLocation);
    const items = tags.length > 0 ? _.filter(filterByLocation,(o)=>{ return _.intersection(o.tags,tags).length > 0 }) : filterByLocation;
    console.log(items);
    const random = Math.floor(Math.random()*items.length);
    const result = _.get(items,`[${random}]`,null);
    this.setState(prevState=>({
      ...prevState,
      result:result
    }))
  }

  handleChange = (e) => {
    const { selectedTags } = this.state;
    const value = e.target.value;
    if (!e.target.checked) {
      this.setState(prevState=>({
        ...prevState,
        selectedTags: _.difference(selectedTags,[value])
      }))
    } else {
      
      this.setState(prevState=>({
        ...prevState,
        selectedTags: _.concat(selectedTags,[value])
      }))
    }
  }

  render() {
    const randomResult = this.state.result;
    const { loadingTags, loadingRestaurants, loadingLocations } = this.state;
    return (
      <div className="App">
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item md={8} xs={12}>
            <Card>
              <CardContent>
                <Grid
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
                >
                  <Grid item md={6} xs={12}>
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
                      <Grid item container xs={12}>
                        {
                          this.state.tags.map((tag)=>{
                            return(<Grid item xs={4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    onChange={this.handleChange}
                                    name="tags"
                                    value={tag.zh_name}
                                  />
                                }
                                label={tag.zh_name}
                              />
                            </Grid>)
                          })
                        }
                      </Grid>
                      <Grid item xs={12}>
                        <button onClick={(e)=>{this.onRandom()}}>Random</button>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Grid
                      container
                      direction="row"
                    >
                      <Grid item xs={4}>餐廳 (Restaurant):</Grid><Grid item xs={8}>{`${_.get(randomResult,"name","無紀錄")}`}</Grid>
                      <Grid item xs={4}>地址 (Address):</Grid><Grid item xs={8} style={{ whiteSpace: 'pre-wrap' }}>{`${_.get(randomResult,"address","無紀錄")}`}</Grid>
                      <Grid item xs={4}>種類 (Type):</Grid><Grid item xs={8}>{`${_.get(randomResult,"type","無紀錄")}`}</Grid>
                      <Grid item xs={4}>價格範圍 / 每人 (Price Range / Per Person):</Grid><Grid item xs={8}>{`${_.get(randomResult,"price_range","無紀錄")}`}</Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        { (loadingLocations || loadingRestaurants || loadingTags) && <Loader />}
      </div>
    ); 
  }
}