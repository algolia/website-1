import React from 'react';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import Highlight from 'react-instantsearch/src/widgets/Highlight';
import {
  getDownloadBucket,
  formatKeywords,
  encode,
  packageLink,
  isEmpty,
} from '../util';

export const License = ({ type }) =>
  type ? <span className="ais-Hit--license">{type}</span> : null;

export const Owner = ({ link, avatar, name }) => (
  <a className="ais-Hit--ownerLink" href={link}>
    <img
      width="20"
      height="20"
      className="ais-Hit--ownerAvatar"
      src={
        `https://res.cloudinary.com/hilnmyskv/image/fetch/w_40,h_40,f_auto,q_80,fl_lossy/${avatar}`
      }
    />
    {name}
  </a>
);

export const Downloads = ({ downloads, humanDownloads }) => (
  <span
    className={`ais-Hit--popular ${getDownloadBucket(downloads)}`}
    title="Downloads last 30 days"
  >
    {humanDownloads}
  </span>
);

export const Links = ({ name, homepage, githubRepo, className }) => (
  <div className={className}>
    <span className="ais-Hit--link-npm">
      <a
        href={`https://www.npmjs.com/package/${name}`}
        title={`NPM page for ${name}`}
      >
        npm
      </a>
    </span>
    {githubRepo
      ? <span className="ais-Hit--link-github">
          <a
            title={`Github repository of ${githubRepo.name}`}
            href={
              `https://github.com/${encode(githubRepo.user)}/${encode(
                githubRepo.project,
              )}${githubRepo.path}`
            }
          >
            GitHub
          </a>
        </span>
      : null}
    {homepage
      ? <span className="ais-Hit--link-homepage">
          <a title={`Homepage of ${name}`} href={homepage}>
            Homepage
          </a>
        </span>
      : null}
  </div>
);

const Hit = ({ hit }) => (
  <div className="ais-Hits--item">
    <a className="ais-Hit--name" href={packageLink(hit.name)}>
      <Highlight attributeName="name" hit={hit} />
    </a>
    <Downloads
      downloads={hit.downloadsLast30Days}
      humanDownloads={hit.humanDownloadsLast30Days}
    />
    <License type={hit.license} />
    <span className="ais-Hit--version">{hit.version}</span>
    <p className="ais-Hit--description">
      <Highlight attributeName="description" hit={hit} />
    </p>
    <Owner {...hit.owner} />
    <span className="ais-Hit--lastUpdate" title="last updated">
      {distanceInWordsToNow(new Date(hit.modified))}
    </span>
    {isEmpty(hit.keywords)
      ? null
      : <span className="ais-Hit--keywords hidden-sm-down">
          {formatKeywords(hit.keywords, hit._highlightResult.keywords)}
        </span>}
    <Links
      className="ais-Hit--links"
      name={hit.name}
      homepage={hit.homepage}
      githubRepo={hit.githubRepo}
    />
  </div>
);

export default Hit;
