import React, { Component } from 'react';
import './App.css';
import './styles.scss';
import i18n from "i18next";
import { withTranslation } from 'react-i18next';
import _ from "lodash";
import { Grid, Card, CardHeader, CardActions, CardContent, Checkbox , FormControlLabel, Chip, Button, Select, FormControl, Collapse, Link, IconButton } from "@material-ui/core";
import Loader from './components/Loader';

import SearchIcon from '@material-ui/icons/Search';
import LocalOfferRoundedIcon from '@material-ui/icons/LocalOfferRounded';
import GTranslateIcon from '@material-ui/icons/GTranslate';
import InstagramIcon from '@material-ui/icons/Instagram';
import FacebookIcon from '@material-ui/icons/Facebook';
import OpenRiceIcon from './components/OpenRiceIcon';


const load = (callback) => {
  window.gapi.client.load("sheets", "v4", () => {
    window.gapi.client.sheets.spreadsheets.values
      .batchGet({
        spreadsheetId: process.env.REACT_APP_SPREADSHEET_ID,
        ranges: [
          `${process.env.REACT_APP_SHEET_ID}!A2:L`
          ,`${process.env.REACT_APP_SHEET_LOC}!A2:B`
        ]
      })
      .then(
        response => {
          const data = response.result.valueRanges;
          const dbRestaurants = data[0].values;
          const dbLocations = data[1].values;

          let locations = dbLocations.map(item => {
            return {
              zh_name: _.get(item,"[0]",""),
              en_name: _.get(item,"[1]",""),
            };
          }) || [];
          let locationsWithData = [];
          let tags = [];

          const restaurants = dbRestaurants.map(item => {
            let loc = _.get(item,"[1]","");
            let isVisible = (_.get(item,"[5]","0") === "1");
            let itemTag = _.get(item,"[4]","").split(";");
            if (isVisible) {
              locationsWithData = _.concat(locationsWithData,[loc]);
              tags = _.concat(tags,itemTag);
            }
            return {
              name: _.get(item,"[0]",""),
              location: _.find(locations,{zh_name: loc}),
              address: _.get(item,"[2]",""),
              addresses: _.get(item,"[2]","").split(/\r?\n/),
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
          
          locations = _.filter(locations, (o)=>{ return (locationsWithData.indexOf(o.zh_name) >= 0); })

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

const RestaurantWebLinks = (props) => {
  const { item } = props;
  const { open_rice, facebook, instagram, name } = (item !== null) ? item : {};

  return(<div>
    <Link href={(open_rice === "" ? `https://www.openrice.com/zh/hongkong/restaurants?what=${name}` : open_rice)} key="lkOpenRice" target="_blank"><OpenRiceIcon fontSize="large" color="primary"/></Link>
    { (facebook !== "") && <Link href={`${facebook}`} key="lkFacebook" target="_blank"><FacebookIcon fontSize="large" color="primary"/></Link> }
    { (instagram !== "") && <Link href={`instagram}`} key="lbInstagram" target="_blank"><InstagramIcon fontSize="large" color="primary"/></Link> }
  </div>)
}

const Restaurant = (props) => {
  const { item } = props;
  const addresses = _.get(item,"addresses",[]);
  const lang = localStorage.getItem('user-language') || 'zh';
  return(<Grid
    container
    direction="row"
    justify="flex-start"
    alignItems="flex-start"
    alignContent="flex-start"
    spacing={2}
  >
    <Grid item sm={4} xs={12} key="lName" className="txt-header">{i18n.t("lb_restaurant")}:</Grid>
    <Grid item sm={8} xs={12} key="rName">{`${_.get(item,"name",i18n.t("lb_no_record"))}`}</Grid>
    <Grid item sm={4} xs={12} key="lLocation" className="txt-header">{i18n.t("lb_location")}:</Grid>
    <Grid item sm={8} xs={12} key="rLocation">{`${_.get(item,`location.${lang}_name`,i18n.t("lb_no_record"))}`}</Grid>
    <Grid item sm={4} xs={12} key="lAddress" className="txt-header">{i18n.t("lb_address")}:</Grid>
    <Grid item sm={8} xs={12} style={{ whiteSpace: 'pre-wrap' }} key="rAddress">
      {
        addresses.length > 0 ? addresses.map((address,i)=>{
          return <Link key={`address_${i}`} href={`https://www.google.com/maps/search/${`${address}`}`} target="_blank" style={{display: "block"}}>{address}</Link>
        }) : i18n.t("lb_no_record")
      }
    </Grid>
    <Grid item sm={4} xs={12} key="lPrice" className="txt-header">{i18n.t("lb_price_range")} / {i18n.t("lb_per_person")}:</Grid>
    <Grid item sm={8} xs={12} key="rPrice">{`${_.get(item,"price_range",i18n.t("lb_no_record"))}`}</Grid>
    { (_.get(item,"discount","") !== "") && <Grid item sm={4} xs={12} key="lDiscount">{i18n.t("lb_discount")}:</Grid> }
    { (_.get(item,"discount","") !== "") && <Grid item sm={8} xs={12} key="rDiscount">{`${_.get(item,"discount",i18n.t("lb_no_record"))}`}</Grid> }
    <Grid item sm={4} xs={12} key="lWebs" className="txt-header">{i18n.t("lb_web_age")}:</Grid>
    <Grid item sm={8} xs={12} key="rWebs">
      { item === null ? i18n.t("lb_no_record") : <RestaurantWebLinks item={item}/> }
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

class App extends Component {
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
    const filterByLocation = (location !== "" && location !== undefined) ? _.filter(this.state.restaurants, (o)=> { return o.location.zh_name === location}) : this.state.restaurants;
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
    const currentLanguage = localStorage.getItem('user-language') || 'zh';
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
                title={i18n.t("lb_header")}
                action={
                  <IconButton aria-label="translate" onClick={(e)=>{
                    if (currentLanguage === 'zh') {
                      localStorage.setItem('user-language','en');
                      i18n.changeLanguage("en");
                    } else {
                      localStorage.setItem('user-language','zh');
                      i18n.changeLanguage("zh");
                    }
                  }}>
                    <GTranslateIcon color="primary"/>
                  </IconButton>
                }
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
                        <option value="">{i18n.t("lb_all_location")}</option>
                        { 
                          (this.state.locations != null) && this.state.locations.map((v)=> { 
                            return(<option value={v.zh_name} key={`op_${v.en_name.replace(" ","_")}`}>{_.get(v,`${currentLanguage}_name`,"")}</option>); 
                          }) 
                        }
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

export default withTranslation()(App);