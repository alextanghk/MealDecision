import React, { Component } from 'react';
import './App.css';
import _ from "lodash";
import './styles.scss';
import { Grid, Card, CardHeader, CardActions, CardContent, Checkbox , FormControlLabel, Chip, Button, Select, FormControl, Collapse } from "@material-ui/core";
import Loader from './components/Loader';
import SearchIcon from '@material-ui/icons/Search';
import LocalOfferRoundedIcon from '@material-ui/icons/LocalOfferRounded';

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
          let tags = [];
          let locations = [];
          const restaurants = data.map(item => {
            const itemTags = _.get(item,"[4]","").split(";");
            tags = _.concat(tags,itemTags);
            locations = _.concat(locations,[item[1]]);
            return {
              name: item[0],
              location: item[1],
              address: item[2],
              price_range: item[3],
              tags: _.get(item,"[4]","").split(";"),
            };
          }) || [];
          callback({
            restaurants: restaurants,
            locations: _.uniq(locations).sort(),
            tags: _.uniq(tags).sort()
          });
        },
        response => {
          callback(false, response.result.error);
        }
      );
  });
}

const Restaurant = (props) => {
  const { name,address, tags, price_range  } = props;
  return(<Grid
    container
    direction="row"
    justify="flex-start"
    alignItems="flex-start"
    alignContent="flex-start"
  >
    <Grid item xs={4} key="lName">餐廳 (Restaurant):</Grid>
    <Grid item xs={8} key="rName">{`${name}`}</Grid>
    <Grid item xs={4} key="lAddress">地址 (Address):</Grid>
    <Grid item xs={8} style={{ whiteSpace: 'pre-wrap' }} key="rAddress">{`${address}`}</Grid>
    <Grid item xs={4} key="lTags">標籤 (Tags):</Grid>
    <Grid item xs={8} key="rTags">
      <div className="tags-container">
      {
        tags.map((tag)=>{
          return(<Chip label={tag} color="primary" />)
        })
      }
      </div>
    </Grid>
    <Grid item xs={4} key="lPrice">價格範圍 / 每人 (Price Range / Per Person):</Grid>
    <Grid item xs={8} key="rPrice">{`${price_range}`}</Grid>
  </Grid>)
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      restaurants: [],
      locations:[],
      tags:[],
      result: null,
      selected: "",
      selectedTags: [],
      loading: true,
      expanded: false
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
    })
  }

  onLoad = (data,error) => {
    if (data) {
      this.setState(prevState => ({
        tags: data.tags,
        locations: data.locations,
        restaurants: data.restaurants,
        loading:false
      }))
    } else {
      this.setState(prevState => ({
        loading:false
      }))
    }
  }

  onRandom = () => {
    const location = this.state.selected;
    const tags = this.state.selectedTags;
    const filterByLocation = (location !== "" && location !== undefined) ? _.filter(this.state.restaurants, {location: location}) : this.state.restaurants;
    const items = tags.length > 0 ? _.filter(filterByLocation,(o)=>{ return _.intersection(o.tags,tags).length > 0 }) : filterByLocation;
    const random = Math.floor(Math.random()*items.length);
    const result = _.get(items,`[${random}]`,null);
    this.setState(prevState=>({
      ...prevState,
      expanded: false,
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
    const { loading, expanded } = this.state;
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
              <CardHeader 
                title="搵食地區 (Location):"
              />
              <CardActions disableSpacing>
                <Grid
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item sm={8} xs={12}>
                    <FormControl style={{width: "100%"}}>
                      <Select 
                        native
                        onChange={(e)=>{
                          this.setState(prevState=>({
                            ...prevState,
                            selected: e.target.value
                          }))
                        }}
                      >
                        <option>請選擇地區</option>
                        { (this.state.locations != null) && this.state.locations.map((v)=> { return(<option value={v}>{v}</option>); }) }
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item sm={2} xs={6} style={{textAlign: "center"}}> 
                    <Button onClick={(e)=>{this.onRandom()}} variant="contained" color="primary">
                      <SearchIcon />
                    </Button >
                  </Grid>
                  <Grid item sm={2} xs={6} style={{textAlign: "center"}}>
                    <Button onClick={(e)=>{this.setState(prevState=>({
                      expanded: !expanded
                    }))}} variant="contained" color="primary">
                      <LocalOfferRoundedIcon />
                    </Button >
                  </Grid>
                </Grid>
              </CardActions>
              <Collapse in={expanded}>
                <CardContent>
                  <Grid
                    container
                    direction="row"
                  >
                    <Grid item container xs={12}>
                      {
                        this.state.tags.map((tag)=>{
                          return(<Grid item xs={4} key={`cb_${tag}`}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  onChange={this.handleChange}
                                  name="tags"
                                  value={tag}
                                />
                              }
                              label={tag}
                            />
                          </Grid>)
                        })
                      }
                    </Grid>
                  </Grid>
                </CardContent>
              </Collapse>
              <CardContent>
                <Restaurant
                    name={`${_.get(randomResult,"name","無紀錄")}`}
                    address={`${_.get(randomResult,"address","無紀錄")}`}
                    price_range={`${_.get(randomResult,"price_range","無紀錄")}`}
                    tags={_.get(randomResult,"tags",[])}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        { (loading) && <Loader />}
      </div>
    ); 
  }
}