import { InformationCircleIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { linkMap } from "common/constant";
import { NFT, Table } from "components/Common";
import moment from "moment";
import { useEffect, useState } from "react";
import { calcAmount } from "service/flips";
import IconTip from "./IconTip";
import LinkTip from "./LinkTip";

const diffDuration = (start: string, end: string) => {
  const s = moment.unix(Number(start));
  const e = moment.unix(Number(end || moment().unix()));
  const d = e.diff(s, "days");
  const h = e.diff(s, "hours");
  const m = e.diff(s, "m");
  if (d) {
    return `${d} 天`;
  }
  if (h) {
    return `${h} 小时`;
  }
  return `${m} 分钟`;
};

const ListItem = ({ value, hash, gas, type, ...props }: any) => (
  <LinkTip value={hash}>
    <div>
      <div>
        <span className="text-sm font-bold">{calcAmount(value)}</span>
        <span className="pl-1 text-xs">ETH</span>
        {type && <IconTip type={type} />}
      </div>
      {gas && (
        <div className="flex items-center gap-x-1 text-xs text-gray-400">
          <img
            alt="gas"
            className="mr-1 align-middle"
            src="/icons/gas.svg"
            width={12}
          />
          <span>{calcAmount(gas)}</span>
        </div>
      )}
    </div>
  </LinkTip>
);

const SearchList = ({ list, loading }: any) => {
  const [page, setPage] = useState(1);
  const onChangePage = (current: number) => {
    setPage(current);
  };
  const pageSize = 10;
  const colums = [
    {
      key: "tokenID",
      label: "NFT",
      labelProps: {
        className: "!relative !z-0",
      },
      render: (_: any, item: any) => {
        return (
          <div className="flex items-center gap-x-2">
            <NFT
              contract={item.contract}
              tokenId={item.tokenID}
              tokenType={item.tokenType}
            />
            <div>
              <div className="text-sm">{item.tokenName}</div>
              <div className="flex items-center gap-x-1">
                <LinkTip
                  type="opensea"
                  value={`${item.contract}/${item.tokenID}`}
                />
                <LinkTip type="blur" value={item.contract} />
                <div className="max-w-[100px]  truncate text-xs opacity-50">
                  #{item.tokenID}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "inHash",
      label: "购入价",
      render: (_: any, item: any) => (
        <ListItem
          value={item.inAmount}
          type={item.inType}
          gas={item.inGas}
          hash={item.inHash}
        />
      ),
    },
    {
      key: "outHash",
      label: "卖出价",
      render: (_: any, item: any) => {
        if (item.type === "in") return "";
        return (
          <ListItem
            value={item.outAmount}
            type={item.outType}
            gas={item.outGas}
            hash={item.outHash}
          />
        );
      },
    },
    {
      key: "flipsAmount",
      label: "盈利",
      render: (flipsAmount: any, item: any) => {
        if (item.type === "in") return "";
        return (
          <div
            className={classNames("font-bold", {
              "text-red-500": flipsAmount < 0,
              "text-green-600": flipsAmount >= 0,
            })}
          >
            {calcAmount(flipsAmount)}{" "}
            <span className="text-xs font-normal">ETH</span>
          </div>
        );
      },
    },
    {
      key: "inTimeStamp",
      label: "持有时长",
      render: (_: any, item: any) => {
        const hours = moment().diff(
          moment.unix(Number(item.inTimeStamp)),
          "hours"
        );
        return (
          <div className="inline-flex items-center text-sm">
            {diffDuration(item.inTimeStamp, item.outTimeStamp)}
            {item.type === "in" && hours < 3 && (
              <div
                className="tooltip ml-1 cursor-pointer align-middle text-orange-400"
                data-tip="现持有时长少于3小时"
              >
                <InformationCircleIcon width={20} />
              </div>
            )}
          </div>
        );
      },
      labelProps: {
        className: "text-right",
      },
    },
    {
      key: "outTimeStamp",
      label: "买卖时间",
      render: (outTimeStamp: any, item: any) => {
        return (
          <div className="text-sm">
            <div className="tooltip ml-1 align-middle" data-tip="购入时间">
              {moment.unix(item.inTimeStamp).format("YYYY/MM/DD HH:mm")}
            </div>
            <br />
            {item.type !== "in" && (
              <div className="tooltip ml-1 align-middle" data-tip="卖出时间">
                {moment.unix(item.outTimeStamp).format("YYYY/MM/DD HH:mm")}
              </div>
            )}
          </div>
        );
      },
      labelProps: {
        className: "text-right",
      },
    },
  ];
  useEffect(() => {
    setPage(1);
  }, [list]);
  return (
    <Table
      loading={loading}
      colums={colums}
      dataSource={list.slice((page - 1) * pageSize, page * pageSize)}
      page={page}
      pageSize={pageSize}
      onChangePage={onChangePage}
      total={list.length}
    />
  );
};

export default SearchList;
