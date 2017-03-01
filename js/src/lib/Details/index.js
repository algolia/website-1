import React from 'react';
import algoliasearch from 'algoliasearch';

import { License, Owner } from '../Hit';
import { Keywords, encode } from '../util';
import schema from '../schema';

const client = algoliasearch('OFCNCOG2CU', 'f54e21fa3a2a0160595bb058179bfb1e');
const index = client.initIndex('npm-search');

const Link = ({ site, url }) => (
  <a href={url} className={`details-link--${site}`}>{url}</a>
);

const Links = ({ name, homepage, githubRepo, className }) => (
  <div className="detail-links">
    <Link site="npm" url={`https://www.npmjs.com/package/${name}`} />
    {githubRepo
      ? <Link
          site="github"
          url={
            `https://github.com/${encode(githubRepo.user)}/${encode(
              githubRepo.project,
            )}${githubRepo.path}`
          }
        />
      : null}
    {homepage ? <Link name="homepage" url={homepage} /> : null}
  </div>
);

class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...schema,
    };
  }

  componentWillMount() {
    index
      .getObject(this.props.objectID)
      .then(content => {
        this.setState(content);
        document.title = `${this.props.objectID} | Yarn`;
      })
      .catch(error => location.href = '/package-not-found');
  }

  render() {
    return (
      <div>
        <h2 className="ais-Hit--name">{this.state.name}</h2>
        <Owner {...this.state.owner} />
        <License type={this.state.license} />
        <Keywords keywords={this.state.keywords} />
        <Links
          name={this.state.name}
          homepage={this.state.homepage}
          githubRepo={this.state.githubRepo}
        />
        <pre>
          {JSON.stringify(this.state, null, '  ')}
        </pre>
      </div>
    );
  }
}

export default Details;
