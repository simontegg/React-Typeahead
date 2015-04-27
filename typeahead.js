var extend = require('xtend')
var get = require('object-path').get
var React = require( 'react' )

//Do the nifty bootstrap thing where the search values are bolded in the search results
var BoldedElement = React.createClass({
  render: function () {
    if (this.props.value = '') return (<span>{this.props.text}</span>)
    var val = this.props.val
    var text = this.props.text
    var boldedText = []
    var arr = text.split(val)
    arr.forEach(function(chunk, i) {
      boldedText.push(chunk)
      if (i < arr.length -1) boldedText.push(val)
    })

    return (<span>
        {
          boldedText.map(function (chunk) {
            return (
              <span style={chunk === val ? {fontWeight: 'bold'} : null }>
                {chunk}
              </span>
            )
          })
        }
        </span>
    )
  }
})

module.exports = React.createClass({
  propTypes: {
    array: React.PropTypes.array,
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
      value: '',
      index: -1,
      listOpen: false,
      isHovered: false,
      autocomplete: '',
      items: []
    };
  },
  handleClick: function(e) {
    console.log('handleClick', e)
    this.props.onSelect(e.target.innerHTML)
    this.setState({value: '', listOpen: false, autocomplete: ''});
  },
  handleChange: function(e) {
    console.log('handleChange', e.target.value)
    var val = e.target.value.toLowerCase()
    var index = 0
    var autocomplete

    var items = this.props.array.reduce(function(memo, el, i) {
      if (i > 9) return memo
      var el = el.toLowerCase();
      if (el.indexOf(val) > -1 || el.replace('-', ' ').indexOf(val) > -1) {
        memo.push(el)
      }
      return memo
    }, [])

    if (val !== '' && items[0] && items[0].indexOf(val) === 0 ) {
      autocomplete = items[0]
    }


    console.log('autocomplete', autocomplete)
    this.setState({
      value: val,
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
      this.setState({value: '', listOpen: true, index: -1, autocomplete: ''});
      this.props.onSelect(e.target.previousSibling.value)

    }
    else if (e.keyCode === 13) {

      this.props.onSelect(e.target.value)
    }
  },
  handleFocus: function(e) {
    this.setState({listOpen: true});
  },
  handleBlur: function(e) {
    if (!this.state.isHovered) this.setState({listOpen: false, autocomplete: '', value: ''})
  },
  handleHoverOn: function (e) {
    this.setState({isHovered: true})
  },
  handleHoverOff: function (e) {
    this.setState({isHovered: false})
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({value: nextProps.value || '', index: -1 });
  },
  render: function() {
    var val = this.state.value
    var items = this.state.listOpen ?
      (this.state.items.length === 0 || val === '') ?
        this.props.array :
        this.state.items
      : []

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
      <div className='field-group' style={get(this.props.style, 'typeahead.fieldGroup')}>
        <input
          type='text'
          className='typeahead'
          readonly
          autocomplete='off'
          style={hintInputStyle}
          tabIndex='-1'
          value={this.state.autocomplete} />
        <input
          type="text"
          className="typeahead"
          id={this.props.id}
          required
          className=""
          style={inputStyle}
          value={this.state.value}
          placeholder={this.props.placeholder}
          onChange={this.handleChange}
          onKeyDown={this.selectItem}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur} />

          <div className="list-group typeahead" style={listGroupStyle}>
            {items.map(function (item, i) {
              return (
                <a
                  key={item}
                  className={i === this.state.index ? 'list-group-item active' : 'list-group-item'}
                  style={get(this.props.style, 'typeahead.item')}
                  onClick={this.handleClick}
                  onMouseOut={this.handleHoverOff}
                  onMouseOver={this.handleHoverOn} >
                  <BoldedElement value={this.props.value} text={item} />
                </a>
              )
            }.bind(this))}
          </div>

      </div>
    );
  }
});
