# HateOasis
[![Build Status][1]][2]
[![Coverage Status][3]][4]
[![npm][5]][6]
[![dependencies Status][7]][8]
[![devDependencies Status][9]][10]
[![Downloads/week][11]][12]
[![Dependabot Status][13]][14]

[1]: https://www.travis-ci.com/gnarr/hateoasis.svg?branch=master
[2]: https://www.travis-ci.com/gnarr/hateoasis
[3]: https://coveralls.io/repos/github/gnarr/hateoasis/badge.svg?branch=master
[4]: https://coveralls.io/github/gnarr/hateoasis?branch=master
[5]: https://img.shields.io/npm/v/hateoasis.svg?style=flat-square
[6]: https://www.npmjs.com/package/hateoasis
[7]: https://david-dm.org/gnarr/hateoasis.svg
[8]: https://david-dm.org/gnarr/hateoasis
[9]: https://david-dm.org/gnarr/hateoasis/dev-status.svg
[10]: https://david-dm.org/gnarr/hateoasis?type=dev
[11]: https://img.shields.io/npm/dw/hateoasis.svg
[12]: https://www.npmjs.com/package/hateoasis
[13]: https://api.dependabot.com/badges/status?host=github&repo=gnarr/hateoasis
[14]: https://dependabot.com

An automatic HATEOAS traversing client.

## Installation

### Node.js

    $ npm install hateoasis

## Example usage:

It's recommended creating interfaces extending the `Hateoas` interface for all api responses.

```javascript
export default interface Client extends Hateoas {
    public name: string;
    public address: string;
    etc...
}
```
The Hateoas interface includes a `links` property of type `Hateoaslinks`. When constructing an `Hateoas` object it requires you to create the links. 

Serverside example:
```javascript
...
const client: Client = {
    name: 'John Doe',
    address: 'Whereville',
    links: [
        {
            rel: 'self',
            method: 'GET',
            href: '/api/clients/1'
        }
    ]
}
res.status(200).json(client);
```
Too use HATEOAS from start, the server needs to have an index showing all available requests:
```javascript
export default interface ApiIndex extends Hateoas {
    version: string;
}
```
```javascript
const index: Hateoas = {
    version: '1.0.0',
    links: [
        {
            rel: 'clients',
            method: 'GET',
            href: '/api/clients'
        }
    ]
}
res.status(200).json(index);
```
Clientside example:
```javascript
axios.get('/api').then(async response => {
    const apiIndex = hateoasis(response.data);

    const client = await apiIndex.request<Client>('client', 'GET');
    console.log(client.data);

    // If using strict TypeScript
    const client = isRequestable(apiIndex) && await apiIndex.request<Client>('client', 'GET');
    console.log(client.data);
});
```
