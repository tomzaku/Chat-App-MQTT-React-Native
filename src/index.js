/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AsyncStorage,
  ListView,
} from 'react-native';

import { FormLabel, FormInput,Button } from 'react-native-elements'

import init from 'react_native_mqtt';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync : {
  }
});
options= {
  host:'test.mosquitto.org',
  port: 8080,
  path: "/testTopic",
  id:"id_"+parseInt(Math.random()*100000),
  topic:"testTopic"
}
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

client = new Paho.MQTT.Client('iot.eclipse.org', 443, 'uname');
// function onConnect(){
//   console.log("onConnect");
//   client.subscribe("testTopic",{qos: 0})
//   var message = new Paho.MQTT.Message("I'm Android3");
//   message.destinationName = "testTopic";
//   client.send(message);
// }
// function onConnectionLost(responseObject){
//   if (responseObject.errorCode !== 0) {
//     console.log("onConnectionLost:"+responseObject.errorMessage);
//   }
// }
// function onFailure(err){
//   console.log("Connect failed!")
//   console.log(err)
// }
// function onMessageArrived(message) {
//   console.log("onMessageArrived:"+message.payloadString);
// }
// client.onConnectionLost = onConnectionLost;
// client.onMessageArrived = onMessageArrived;
// client.connect({onSuccess:onConnect,
//                 timeout: 3,
//                 onFailure:onFailure});
// console.log(client.onMessageArrived)




export default class ChatMQTT extends Component {
  constructor(props){
    super(props)
    this.state={
      message:"",
      client:client,
      listMessages:[],
      dataSource:ds.cloneWithRows([])
    }
    client.onConnectionLost = this.onConnectionLost;
    client.onMessageArrived = this.onMessageArrived;
    client.connect({onSuccess:this.onConnect,
                    useSSL: true,
                    timeout:3,
                    onFailure:this.onFailure});
  }
  onConnect=()=>{
    console.log("onConnect");
    client.subscribe("testTopic",{qos: 0})
    var message = new Paho.MQTT.Message("Welcom "+options.id);
    message.destinationName = options.topic;
    client.send(message);
  }
  onConnectionLost=(responseObject)=>{
    // setTimeout(this.onConnect,100)
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:"+responseObject.errorMessage);
    }
  }
  onFailure(err){
    console.log("Connect failed!")
    console.log(err)
  }
  onMessageArrived=(message)=> {
    console.log("onMessageArrived:"+message.payloadString);
    newListMessages = this.state.listMessages
    newListMessages.push(message.payloadString)
    this.setState({
      listMessages:newListMessages,
      dataSource:ds.cloneWithRows(newListMessages)
    })
    console.log("listMessages:",message)
  }
  onChangeMessage=(text)=>{
    this.setState({
      message:text
    })
  }
  sendMessage=()=>{
    var message = new Paho.MQTT.Message(options.id+":"+this.state.message);
    message.destinationName = options.topic;
    client.send(message);
  }
  _renderRow=(data)=>{
    idMessage = data.split(":");
    return(
      <View style={idMessage[0]==options.id?styles.myMessageComponent:(idMessage.length==1?styles.introMessage:styles.messageComponent)}>
        <Text style={idMessage.length==1?styles.textIntro:styles.textMessage}>
          {data}
        </Text>
      </View>
    )
  }
  render() {
    return (
      <View style={styles.container}>
        <FormLabel>Message</FormLabel>
        <FormInput onChangeText={this.onChangeMessage}/>
        <Button
          buttonStyle={{marginTop:16,}}
          icon={{name: 'send'}}
          title='SUMBMIT'
          backgroundColor={'#397af8'}
          onPress={this.sendMessage}
          />
        <View style={styles.messageBox}>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this._renderRow}
            enableEmptySections
            />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:70,

  },
  messageBox:{
    margin:16,
  },
  myMessageComponent:{
    backgroundColor:'#000000',
    borderRadius:3,
    padding:5,
    marginBottom:5,
  },
  messageComponent:{
    marginBottom:5,
    backgroundColor:'#0075e2',
    padding:5,
    borderRadius:3,
  },
  introMessage:{

  },
  textIntro:{
    color:'black',
    fontSize:12,
  },
  textMessage:{
    color:'white',
    fontSize:16,
  },
});
