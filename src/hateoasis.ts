import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export type RouteMethod = `POST` | `GET` | `PUT` | `PATCH` | `DELETE`;

export interface HateoasLink {
  rel: string;
  method: RouteMethod;
  href: string;
}

export type HateoasLinks = HateoasLink[];

export interface Hateoas {
  links: HateoasLinks;
  request?: <T>(
    rel: string,
    method?: RouteMethod,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T & Hateoas>>;
}

interface Requesteable extends Hateoas {
  request: <T>(
    rel: string,
    method?: RouteMethod,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T & Hateoas>>;
}

export function isRequestable(item: any): item is Requesteable {
  return item.request && typeof item.request === "function";
}

export function isHateoasLink(item: any): item is HateoasLink {
  return (
    item.rel !== undefined &&
    item.method !== undefined &&
    item.href !== undefined
  );
}

const hateoasis = <T>(item: any): T /*  & Hateoasified */ => {
  if (!item) {
    return item;
  }

  Object.values(item).map((value) => {
    const type = typeof value;
    if (item !== null && type === "object") {
      if (Array.isArray(value)) {
        if (value.some(isHateoasLink) === false) {
          value.map(hateoasis);
        }
      } else {
        hateoasis(value);
      }
    }
  });

  if (Array.isArray(item.links) && item.links.every(isHateoasLink)) {
    item.getLink = (rel: string, method: RouteMethod): HateoasLink => {
      const [link] = item.links.filter(
        (l: HateoasLink) => l.rel === rel && l.method === method
      );
      if (!link) {
        throw new Error(`Link not found`);
      }
      return link;
    };

    item.request = <R>(
      rel: string,
      method: RouteMethod = `GET`,
      config: AxiosRequestConfig = {}
    ): Promise<AxiosResponse<R & Hateoas>> => {
      const link = item.getLink(rel, method);
      return axios(
        Object.assign(config, {
          method: link.method,
          url: link.href,
        } as AxiosRequestConfig)
      ).then((res: AxiosResponse<R & Hateoas>) => {
        res.data = hateoasis(res.data);
        return res;
      });
    };
  }
  return item;
};

export default hateoasis;
