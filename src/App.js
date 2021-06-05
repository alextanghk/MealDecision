import React, { Component } from 'react';
import './App.css';
import _ from "lodash";
import './styles.scss';
import { Grid, Card, CardHeader, CardActions, CardContent, Checkbox , FormControlLabel, Chip, Button, Select, FormControl, Collapse, Link } from "@material-ui/core";
import Loader from './components/Loader';
import SearchIcon from '@material-ui/icons/Search';
import LocalOfferRoundedIcon from '@material-ui/icons/LocalOfferRounded';
import InstagramIcon from '@material-ui/icons/Instagram';
import FacebookIcon from '@material-ui/icons/Facebook';
import OpenRiceIcon from './components/OpenRiceIcon';

const load = (callback) => {
  window.gapi.client.load("sheets", "v4", () => {
    window.gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: process.env.REACT_APP_SPREADSHEET_ID,
        range: `${process.env.REACT_APP_SHEET_ID}!A2:L`
      })
      .then(
        response => {
          const data = response.result.values;
         
          const restaurants = data.map(item => {
            return {
              name: _.get(item,"[0]",""),
              location: _.get(item,"[1]",""),
              address: _.get(item,"[2]",""),
              price_range: _.get(item,"[3]",""),
              tags: _.get(item,"[4]","").split(";"),
              visible: (_.get(item,"[5]","0") === "1"),
              feature: _.get(item,"[6]",""),
              discount: _.get(item,"[7]",""),
              open_rice: _.get(item,"[8]",""),
              facebook: _.get(item,"[9]",""),
              instagram: _.get(item,"[10]",""),
              menu: _.get(item,"[11]",""),
            };
          }) || [];
          let tags = [];
          let locations = [];
          restaurants.forEach((item)=>{
            if (item.visible) {
              tags = _.concat(tags,item.tags);
              locations = _.concat(locations,[item.location]);
            }
          });

          callback({
            restaurants: _.filter(restaurants,{visible:true}),
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
  const { item } = props;
  return(<Grid
    container
    direction="row"
    justify="flex-start"
    alignItems="flex-start"
    alignContent="flex-start"
    spacing={2}
  >
    <Grid item sm={4} xs={12} key="lName" className="txt-header">餐廳 (Restaurant):</Grid>
    <Grid item sm={8} xs={12} key="rName">{`${_.get(item,"name","無紀錄")}`}</Grid>
    <Grid item sm={4} xs={12} key="lLocation" className="txt-header">地區 (Location):</Grid>
    <Grid item sm={8} xs={12} key="rLocation">{`${_.get(item,"location","無紀錄")}`}</Grid>
    <Grid item sm={4} xs={12} key="lAddress" className="txt-header">地址 (Address):</Grid>
    <Grid item sm={8} xs={12} style={{ whiteSpace: 'pre-wrap' }} key="rAddress">{`${_.get(item,"address","無紀錄")}`}</Grid>
    <Grid item sm={4} xs={12} key="lPrice" className="txt-header">價格範圍 / 每人 (Price Range / Per Person):</Grid>
    <Grid item sm={8} xs={12} key="rPrice">{`${_.get(item,"price_range","無紀錄")}`}</Grid>
    { (_.get(item,"discount","") !== "") && <Grid item sm={4} xs={12} key="lDiscount">優惠 (Discount):</Grid> }
    { (_.get(item,"discount","") !== "") && <Grid item sm={8} xs={12} key="rDiscount">{`${_.get(item,"discount","無紀錄")}`}</Grid> }
    { (_.get(item,"open_rice","") !== "" || _.get(item,"facebook","") !== "" || _.get(item,"instagram","") !== "") && <Grid item sm={4} xs={12} key="lWebs" className="txt-header">網站 (Web Page):</Grid> } 
    <Grid item sm={8} xs={12} key="rWebs">
      { (_.get(item,"open_rice","") !== "") && <Link href={`${_.get(item,"open_rice","")}`} key="lkOpenRice" target="_blank"><OpenRiceIcon fontSize="large" color="primary"/></Link> }
      { (_.get(item,"facebook","") !== "") && <Link href={`${_.get(item,"facebook","")}`} key="lkFacebook" target="_blank"><FacebookIcon fontSize="large" color="primary"/></Link> }
      { (_.get(item,"instagram","") !== "") && <Link href={`${_.get(item,"facebook","")}`} key="lbInstagram" target="_blank"><InstagramIcon fontSize="large" color="primary"/></Link> }
    </Grid>
    <Grid item sm={12} xs={12} key="rTags">
      <div className="tags-container">
      {
        _.get(item,"tags",[]).map((tag)=>{
          return(<Chip label={tag} color="primary" key={`rt${tag}`}/>)
        })
      }
      </div>
    </Grid>
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
          <Grid item md={6} sm={12} xs={12}>
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
                        <option value="">全地區</option>
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
                  item={randomResult}
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