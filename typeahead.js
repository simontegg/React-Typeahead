var extend = require('xtend')
var get = require('object-path').get
var React = require( 'react' )

//Do the nifty bootstrap thing where the search values are bolded in the search results
var BoldedElement = React.createClass({
  render: function () {
    if (this.props.value = '') return (React.createElement("span", null, this.props.text))
    var val = this.props.val
    var text = this.props.text
    var boldedText = []
    var arr = text.split(val)
    arr.forEach(function(chunk, i) {
      boldedText.push(chunk)
      if (i < arr.length -1) boldedText.push(val)
    })

    return (React.createElement("span", null,

          boldedText.map(function (chunk) {
            return (
              React.createElement("span", {style: chunk === val ? {fontWeight: 'bold'} : null},
                chunk
              )
            )
          })

        )
    )
  }
})

module.exports = React.createClass({
  propTypes: {
    array: React.PropTypes.array, // [{id: 'uniqueId', label: 'string'}
    id: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    onSelect: React.PropTypes.func,
    style: React.PropTypes.object
  },

  getDefaultProps: function () {
    return {
      style: {
        typeahead: {
          input: {},
          fieldGroup: {},
          listGroup: {},
          item: {},
        }
      }
    }
  },

  getInitialState: function() {
    return {
      value: {text: ''},
      index: -1,
      listOpen: false,
      isHovered: false,
      autocomplete: {},
      items: []
    };
  },
  handleClick: function(item) {
    return function (e) {
      this.props.onSelect(item.id)
      this.setState({value: {}, listOpen: false, autocomplete: {}});
    }.bind(this)
  },
  handleChange: function(e) {
    console.log('handleChange', e.target.value)
    var text = e.target.value.toLowerCase()
    var index = 0
    var autocomplete = {}

    var items = this.props.array.reduce(function(memo, item, i) {
      if (i > 9) return memo
      var el = item.label.toLowerCase();
      if (el.indexOf(text) > -1 || el.replace('-', ' ').indexOf(text) > -1) {
        memo.push(item)
      }
      return memo
    }, [])

    if (text !== '' && items[0] && items[0].label.indexOf(text) === 0 ) {
      autocomplete = items[0]
    }


    console.log('autocomplete', autocomplete)
    this.setState({
      value: {label: text},
      index: 0,
      autocomplete: autocomplete,
      items: items
    })



  },
  selectItem: function(e) {
    console.log(e.keyCode, e.target.value)
    // if (this.state.selected) return;

    if (e.keyCode === 40 && this.state.index < this.items.length - 1) {
      this.setState({index: ++this.state.index});
    }
    else if (e.keyCode === 38 && this.state.index > 0) {
      this.setState({index: --this.state.index});
    }
    else if (e.keyCode === 9) {
      e.preventDefault()
      this.props.onSelect(this.state.autocomplete.id)
      this.setState({value: {text: ''}, listOpen: true, index: -1, autocomplete: {}});


    }
    else if (e.keyCode === 13) {
      this.props.onSelect(this.state.value.id)
    }
  },
  handleFocus: function(e) {
    this.setState({listOpen: true});
  },
  handleBlur: function(e) {
    if (!this.state.isHovered) this.setState({listOpen: false, autocomplete: {}, value: {text: ''}})
  },
  handleHoverOn: function (e) {
    this.setState({isHovered: true})
  },
  handleHoverOff: function (e) {
    this.setState({isHovered: false})
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({array: nextProps.array, index: -1 });
  },
  render: function() {
    var val = this.state.value
    var items = this.state.listOpen ?
      (this.state.items.length === 0 || typeof val.id === 'undefined') ?
        this.props.array :
        this.state.items
      : []

    console.log('items', items, this.props.array, this.state.items, val)

    var listGroupStyle = extend(
      get(this.props.style, 'typeahead.listGroup'),
      {
        position: 'absolute',
        zIndex: 1,
        width: '200px',
      }
    )
    var hintInputStyle = extend(
      get(this.props.style, 'typeahead.input'),
      {
        position: 'absolute',
        borderColor: 'transparent',
        boxShadow: 'none',
        opacity: 1,
        color: '#999'
      }
    )

    var inputStyle = extend(
      get(this.props.style, 'typeahead.input')  ,
      {
        position: 'relative',
        verticalAlign: 'top',
        backgroundColor: 'transparent',
      }
    )

    return (
      React.createElement("div", {className: "field-group", style: get(this.props.style, 'typeahead.fieldGroup')},
        React.createElement("input", {
          type: "text",
          className: "typeahead",
          readonly: true,
          autocomplete: "off",
          style: hintInputStyle,
          tabIndex: "-1",
        value: this.state.autocomplete.text}),
        React.createElement("input", {
          type: "text",
          className: "typeahead",
          id: this.props.id,
          required: true,
          className: "",
          style: inputStyle,
          value: this.state.value.text,
          placeholder: this.props.placeholder,
          onChange: this.handleChange,
          onKeyDown: this.selectItem,
          onFocus: this.handleFocus,
          onBlur: this.handleBlur}),

          React.createElement("div", {className: "list-group typeahead", style: listGroupStyle},
            items.map(function (item, i) {
              return (
                React.createElement("a", {
                  key: item.id + 'list-item',
                  className: i === this.state.index ? 'list-group-item active' : 'list-group-item',
                  style: get(this.props.style, 'typeahead.item'),
                  onClick: this.handleClick(item),
                  onMouseOut: this.handleHoverOff,
                  onMouseOver: this.handleHoverOn},
                  React.createElement(BoldedElement, {value: this.state.value.text, text: item.label})
                )
              )
            }.bind(this))
          )

      )
    );
  }
});
