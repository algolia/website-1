import React from 'react';
import { InstantSearch, Configure, SearchBox } from 'react-instantsearch/dom';
import Results from './Results';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ''
    }
  }

  onSearchStateChange(nextSearchState) {
    this.setState({
      query: nextSearchState.query
    });
  }

  render() {
    return (
      <InstantSearch
        appId='OFCNCOG2CU'
        apiKey='f54e21fa3a2a0160595bb058179bfb1e'
        indexName='npm-search'
        className='pkg-search'
        onSearchStateChange={this.onSearchStateChange.bind(this)}
      >
        <Configure
          key={this.state.query}
          hitsPerPage={5}
          optionalFacetFilters={`name:${this.state.query}`}
          facets={['keywords']}
        />
        <SearchBox 
          translations={{
            placeholder: "Search packages (i.e. babel, webpack, react…)"
          }}
        />
        <Results />
      </InstantSearch>
    );
  }
};

export default Search;
