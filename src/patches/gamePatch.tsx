import { routerHook } from "@decky/api";
import {
  afterPatch,
  appDetailsClasses,
  createReactTreePatcher,
  findInReactTree,
} from "@decky/ui";
import { ReactElement } from "react";
import BadgesContainer from "../components/badges-container";

const patchGame = () => {
  return routerHook.addPatch(
    "/library/app/:appid",
    (props: { path: string; children: ReactElement }) => {
      const routeProps = findInReactTree(props, (x: any) => x?.renderFunc);
      if (routeProps) {
        let appId: number | undefined;

        const patchHandler = createReactTreePatcher(
          [
            (tree: any) => {
              const children = findInReactTree(
                tree,
                (x: any) => x?.props?.children?.props?.overview,
              )?.props?.children;
              if (typeof children !== "object") {
                return null;
              }

              const overview = children.props?.overview;
              if (typeof overview !== "object") {
                return null;
              }

              if (typeof overview.appid !== "number") {
                return null;
              }

              ({ appid: appId } = overview);

              return children;
            },
          ],
          (_: Array<Record<string, unknown>>, ret?: ReactElement) => {
            type ParentElement = ReactElement<{
              children: ReactElement[];
              className: string;
            }>;

            const parent = findInReactTree(ret, (x: ParentElement) =>
              x?.props?.className?.includes(
                appDetailsClasses.AppDetailsOverviewPanel,
              ),
            ) as ParentElement;

            if (typeof parent !== "object") {
              return ret;
            }

            if (typeof appId !== "number") {
              return ret;
            }

            parent.props.children = [
              <BadgesContainer appId={appId} />,
              parent.props.children as unknown as ReactElement,
            ];

            return ret;
          },
        );

        afterPatch(routeProps, "renderFunc", patchHandler);
      }

      return props;
    },
  );
};

export default patchGame;
