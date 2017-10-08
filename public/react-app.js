import React, { Component } from 'react'
import ReactDOM from 'react-dom'

class MyReactApp extends Component {
	render(){
		return (<div> This is a REACT Component! </div>);
	}
}

ReactDOM.render(<MyReactApp />, document.getElementById('MyReactApp'))