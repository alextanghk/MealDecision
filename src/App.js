import React, { Component } from 'react';
import './App.css';
import _ from "lodash";
import './styles.scss';
import { Grid, Card, CardHeader,CardContent } from "@material-ui/core";

const locations = [
  "薄扶林","石塘咀","西營盤","上環","中環","金鐘","灣仔","銅鑼灣","天后","炮台山","鰂魚涌","北角","太古","杏花村","柴灣","西灣河","筲箕灣","黃竹坑","利東","海怡","深水埗","油麻地","旺角","太子","尖沙咀","紅磡","何文田","九龍塘","九龍灣","牛頭角","樂富","佐敦","九龍城","黃大仙","石硤尾","鑽石山","彩虹","油塘","調景嶺","觀塘","葵芳","葵涌","葵興","大窩口","荔景","荔枝角","美孚","長沙灣","荃灣","屯門","元朗","朗屏","新界北","大埔","太和","錦上路","天水圍","大圍","粉嶺","青衣","東涌","沙田","火炭","上水","屯門中心","友愛","馬鞍山","第一城","石門","大水坑","兆康","西貢","將軍澳","康城","坑口","寶琳","長洲","平洲","大嶼山"
];

const load = (callback) => {
  window.gapi.client.load("sheets", "v4", () => {
    window.gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: process.env.REACT_APP_SPREADSHEET_ID,
        range: `${process.env.REACT_APP_SHEET_ID}!A2:D`
      })
      .then(
        response => {
          const data = response.result.values;
          const items = data.map(item => ({
            name: item[0],
            location: item[1],
            address: item[2],
            price_range: item[3],
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
    console.log("here");
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
        items: data.items
      }))
    }
  }

  onRandom = () => {
    const location = this.state.selected;
    console.log(this.state.items);
    const items = (location !== "" && location !== undefined) ? _.filter(this.state.items, {location: location}) : this.state.items;
    console.log(items);
    const random = Math.floor(Math.random()*items.length);
    const result = _.get(items,`[${random}]`,null);
    console.log(result);
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
                          { locations.map((v)=> { return(<option value={v}>{v}</option>); }) }
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