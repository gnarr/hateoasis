import axios from "axios";
import hateoasis, { Hateoas, isHateoasLink, isRequestable } from "./hateoasis";

describe("isHateoasLink", () => {
  it("returns false on object without rel, method and href", () => {
    const item = {};
    expect(isHateoasLink(item)).toBe(false);
  });

  it("returns false on object without method and href", () => {
    const item = {
      rel: "self",
    };
    expect(isHateoasLink(item)).toBe(false);
  });

  it("returns false on object without rel and href", () => {
    const item = {
      method: "GET",
    };
    expect(isHateoasLink(item)).toBe(false);
  });

  it("returns false on object without rel and method", () => {
    const item = {
      href: "/api",
    };
    expect(isHateoasLink(item)).toBe(false);
  });

  it("returns false on object without rel", () => {
    const item = {
      method: "GET",
      href: "/api",
    };
    expect(isHateoasLink(item)).toBe(false);
  });

  it("returns false on object without method", () => {
    const item = {
      rel: "self",
      href: "/api",
    };
    expect(isHateoasLink(item)).toBe(false);
  });

  it("returns false on object without href", () => {
    const item = {
      rel: "self",
      method: "GET",
    };
    expect(isHateoasLink(item)).toBe(false);
  });

  it("returns true on object with rel, method and href", () => {
    const item = {
      rel: "self",
      method: "GET",
      href: "/api",
    };
    expect(isHateoasLink(item)).toBe(true);
  });
});

interface Item extends Hateoas {
  flerp: string;
}

interface ItemWithHateoasChild {
  flerp: string;
  child: Item;
}

interface ItemWithHateoasChildren {
  flerp: string;
  children: Item[];
}

interface ItemWithChildAndChildren extends Hateoas {
  lerp: number;
  derp: string;
  kerp: boolean;
  ferp: () => boolean;
  child: Item;
  children: Item[];
}

describe("hateoasify", () => {
  it("returns null when receiving null", () => {
    const item = null;
    expect(hateoasis(item)).toBe(null);
  });

  it("returns undefined when receiving undefined", () => {
    const item = undefined;
    expect(hateoasis(item)).toBe(undefined);
  });

  it("does not add request to a number", () => {
    const item = 1;
    expect(
      typeof hateoasis<Hateoas>((item as unknown) as Hateoas).request
    ).toBe("undefined");
  });

  it("does not add request to a string", () => {
    const item = "";
    expect(
      typeof hateoasis<Hateoas>((item as unknown) as Hateoas).request
    ).toBe("undefined");
  });

  it("does not add request to a boolean", () => {
    const item = true;
    expect(
      typeof hateoasis<Hateoas>((item as unknown) as Hateoas).request
    ).toBe("undefined");
  });

  it("does not add request to an empty object", () => {
    const item = {};
    expect(
      typeof hateoasis<Hateoas>((item as unknown) as Hateoas).request
    ).toBe("undefined");
  });

  it("does not add request to an object without links", () => {
    const item = {
      lerp: 1,
      derp: "herp",
      kerp: true,
      ferp: () => true,
    };
    expect(
      typeof hateoasis<Hateoas>((item as unknown) as Hateoas).request
    ).toBe("undefined");
  });

  it("adds request to an object with links", () => {
    const item: Hateoas = {
      links: [
        {
          rel: "self",
          method: "GET",
          href: "http://localhost:3000/api",
        },
      ],
    };
    expect(typeof hateoasis<Hateoas>(item).request).toBe("function");
  });

  it("adds request to an object child with links", () => {
    const item: ItemWithHateoasChild = {
      flerp: "snerp",
      child: {
        flerp: "snerp",
        links: [
          {
            rel: "self",
            method: "GET",
            href: "/api/item",
          },
        ],
      },
    };
    expect(typeof hateoasis<ItemWithHateoasChild>(item).child.request).toBe(
      "function"
    );
  });

  it("adds request to every child in object child array with links", () => {
    const item: ItemWithHateoasChildren = {
      flerp: "snerp",
      children: [
        {
          flerp: "snerp",
          links: [
            {
              rel: "self",
              method: "GET",
              href: "/api/item/1",
            },
          ],
        },
        {
          flerp: "snerp",
          links: [
            {
              rel: "self",
              method: "GET",
              href: "/api/item/2",
            },
          ],
        },
      ],
    };
    const [child] = hateoasis<ItemWithHateoasChildren>(item).children;
    expect(typeof child.request).toBe("function");
  });

  it("Hateoasfies an object with links, child with links and children with links", () => {
    const item: ItemWithChildAndChildren = {
      lerp: 1,
      derp: "herp",
      kerp: true,
      ferp: () => true,
      links: [
        {
          rel: "self",
          method: "GET",
          href: "http://localhost:3000/api",
        },
      ],
      child: {
        flerp: "snerp",
        links: [
          {
            rel: "self",
            method: "GET",
            href: "/api/item",
          },
        ],
      },
      children: [
        {
          flerp: "snerp",
          links: [
            {
              rel: "self",
              method: "GET",
              href: "/api/item/1",
            },
          ],
        },
        {
          flerp: "snerp",
          links: [
            {
              rel: "self",
              method: "GET",
              href: "/api/item/2",
            },
          ],
        },
      ],
    };
    expect(typeof hateoasis<ItemWithChildAndChildren>(item).request).toBe(
      "function"
    );
    expect(typeof hateoasis<ItemWithHateoasChild>(item).child.request).toBe(
      "function"
    );
    const [child] = hateoasis<ItemWithHateoasChildren>(item).children;
    expect(typeof child.request).toBe("function");
  });
});

jest.mock("axios");

describe("request", () => {
  it("returns the requested link", () => {
    const mockedRes = { status: 200, data: {} };
    ((axios as unknown) as jest.Mock).mockResolvedValueOnce(mockedRes);
    const item: Hateoas = {
      links: [
        {
          rel: "self",
          method: "GET",
          href: "/api",
        },
      ],
    };

    const links = hateoasis<Hateoas>(item);
    expect(isRequestable(links) && links.request("self"));
  });

  it("throws an error when a non-existant link is requested", async () => {
    const item: Hateoas = {
      links: [
        {
          rel: "self",
          method: "GET",
          href: "/api",
        },
      ],
    };
    const links = hateoasis<Hateoas>(item);
    await expect(async () => {
      return (
        isRequestable(links) && (await links.request("invalid", "POST", {}))
      );
    }).rejects.toEqual(new Error(`Link not found`));
  });
});
