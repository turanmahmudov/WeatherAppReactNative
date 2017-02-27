'use strict';
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Animated,
    ActivityIndicator
} from 'react-native';

import weatherIcon from "./utils/icons"
import renderIf from "./utils/renderIf"

class WeatherApp extends Component {
    state = {
        initialPosition: 'unknown',
        lastPosition: 'unknown',
        mainTempDegree: '',
        mainTempIcon: weatherIcon(''),
        cityName: '',
        dayOrNight: 'day',

        firstDayTempDegree: '',
        firstDayTempIcon: weatherIcon(''),
        firstDayName: '',

        secondDayTempDegree: '',
        secondDayTempIcon: weatherIcon(''),
        secondDayName: '',

        thirdDayTempDegree: '',
        thirdDayTempIcon: weatherIcon(''),
        thirdDayName: '',

        loading: true
    };

    watchID: ?number = null;

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                var initialPosition = JSON.stringify(position);
                this.setState({initialPosition});

                this.fetchWeather(initialPosition)
                this.fetchForecast(initialPosition)
            },
            (error) => alert(JSON.stringify(error)),
            {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000}
        );

        this.watchID = navigator.geolocation.watchPosition(
            (position) => {
                var lastPosition = JSON.stringify(position);
                this.setState({lastPosition});

                this.fetchWeather(lastPosition)
                this.fetchForecast(lastPosition)
            }
        );
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }

    fetchWeather(location) {
        var location = JSON.parse(location)

        fetch('http://api.openweathermap.org/data/2.5/weather?lat='+location.coords.latitude+'&lon='+location.coords.longitude+'&units=metric&appid=2a25e05b106a2eb0192c95b46fb838ab')
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({mainTempDegree: Math.round(responseJson.main.temp)})
                this.setState({mainTempIcon: weatherIcon(responseJson.weather[0].icon)});
                this.setState({cityName: responseJson.name})
                this.setState({dayOrNight: responseJson.dt < responseJson.sys.sunrise ? 'night' : 'day'})
            })
            .catch((error) => {
                console.error(error);
            });
    }

    fetchForecast(location) {
        var location = JSON.parse(location)

        var days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];

        fetch('http://api.openweathermap.org/data/2.5/forecast/daily?lat='+location.coords.latitude+'&lon='+location.coords.longitude+'&units=metric&cnt=4&appid=2a25e05b106a2eb0192c95b46fb838ab')
            .then((response) => response.json())
            .then((responseJson) => {
                for (var i = 1; i < responseJson.list.length; i++) {
                    var listEl = responseJson.list[i];

                    var date = new Date(listEl.dt*1000);

                    var nowUtc = new Date( date.getTime() + (date.getTimezoneOffset() * 60000));

                    var dayOfWeek = days[new Date(nowUtc).getDay()];

                    switch(i) {
                        case 1:
                            this.setState({firstDayName: 'TOMORROW', firstDayTempDegree: Math.round(listEl.temp.day), firstDayTempIcon: weatherIcon(listEl.weather[0].icon)})
                            break;
                        case 2:
                            this.setState({secondDayName: dayOfWeek, secondDayTempDegree: Math.round(listEl.temp.day), secondDayTempIcon: weatherIcon(listEl.weather[0].icon)})
                            break;
                        case 3:
                            this.setState({thirdDayName: dayOfWeek, thirdDayTempDegree: Math.round(listEl.temp.day), thirdDayTempIcon: weatherIcon(listEl.weather[0].icon)})
                            break;
                    }

                    this.setState({loading:false})
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    render() {

        return (

            <Animated.View style={[styles.container, (this.state.dayOrNight == 'day' ? styles.dayView : styles.nightView)]}>
                <Text style={[styles.cityName, (this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor)]}>{this.state.cityName}</Text>
                {renderIf(!this.state.loading)(
                <Text style={[styles.mainDayName, (this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor)]}>TODAY</Text>
                )}

                <View style={{position: 'absolute', top: 30, right: 30, flex: 1, flexDirection: 'row'}}>
                    <Image
                        style={{width: 30, height: 30}}
                        source={require('./img/find1.png')}
                    />
                </View>

                {renderIf(this.state.loading)(
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -100}}>
                    <Text style={[{fontSize: 30, }, (this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor)]}>Loading...</Text>
                </View>
                )}

                {renderIf(!this.state.loading)(
                <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
                    <Text style={[styles.icon, (this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor)]}>
                        {this.state.mainTempIcon}
                    </Text>
                    <Text style={[styles.mainDegree, (this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor)]}>{this.state.mainTempDegree}°</Text>
                </View>
                )}

                {renderIf(!this.state.loading)(
                <View style={{marginTop: 70}}>

                    <View style={[styles.listViewMain]}>
                        <Text style={[(this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor), styles.forecastDayName]}>
                            {this.state.firstDayName}
                        </Text>
                        <Text style={[(this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor), styles.forecastDegree, {position: 'absolute', right: 30}]}>
                            {this.state.firstDayTempDegree}°
                        </Text>
                        <Text style={[styles.iconSmall, (this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor), {position: 'absolute', right: 0}]}>
                            {this.state.firstDayTempIcon}
                        </Text>
                    </View>

                    <View style={[styles.listViewDivider, {backgroundColor: (this.state.dayOrNight == 'day' ? '#262634' : '#ffffff')}]} />

                    <View style={[styles.listViewMain]}>
                        <Text style={[(this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor), styles.forecastDayName]}>
                            {this.state.secondDayName}
                        </Text>
                        <Text style={[(this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor), styles.forecastDegree, {position: 'absolute', right: 30}]}>
                            {this.state.secondDayTempDegree}°
                        </Text>
                        <Text style={[styles.iconSmall, (this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor), {position: 'absolute', right: 0}]}>
                            {this.state.secondDayTempIcon}
                        </Text>
                    </View>

                    <View style={[styles.listViewDivider, {backgroundColor: (this.state.dayOrNight == 'day' ? '#262634' : '#ffffff')}]} />

                    <View style={[styles.listViewMain]}>
                        <Text style={[(this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor), styles.forecastDayName]}>
                            {this.state.thirdDayName}
                        </Text>
                        <Text style={[(this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor), styles.forecastDegree, {position: 'absolute', right: 30}]}>
                            {this.state.thirdDayTempDegree}°
                        </Text>
                        <Text style={[styles.iconSmall, (this.state.dayOrNight == 'day' ? styles.dayColor : styles.nightColor), {position: 'absolute', right: 0}]}>
                            {this.state.thirdDayTempIcon}
                        </Text>
                    </View>
                </View>
                )}
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    dayView: {
        backgroundColor: '#F0F041'
    },
    nightView: {
        backgroundColor: '#262634'
    },
    dayColor: {
        color: '#262634'
    },
    nightColor: {
        color: '#ffffff'
    },
    cityName: {
        fontSize: 24,
        margin: 30,
        marginBottom: 10
    },
    mainDayName: {
        fontSize: 13,
        margin: 30,
        marginTop: 0
    },
    mainDegree: {
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: 10
    },
    icon: {
        fontFamily: 'weathericons',
        fontSize: 50,
        padding: 0
    },
    iconSmall: {
        fontFamily: 'weathericons',
        padding: 0
    },
    listViewMain: {
        margin: 20,
        marginLeft: 30,
        marginRight: 30,
        flex: 1,
        flexDirection: 'row'
    },
    listViewDivider: {
        marginLeft: 30,
        marginRight: 30,
        height: 1
    },
    forecastDayName: {
        fontSize: 13
    },
    forecastDegree: {
        fontWeight: 'bold'
    }
});

AppRegistry.registerComponent('WeatherApp', () => WeatherApp);
