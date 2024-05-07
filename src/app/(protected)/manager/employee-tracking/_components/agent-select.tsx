"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import { UserSelectNonSensitive } from "@/lib/common-types";
import { cn } from "@/lib/utils";

const AgentSelect = ({
  agents,
  searchParamName,
}: {
  agents: UserSelectNonSensitive[];
  searchParamName: string;
}) => {
  const [open, setOpen] = React.useState(false);
  const [agentId, setAgentId] = useSearchParamState<string>({
    searchParamName,
    defaultValue: "",
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {agentId
            ? agents.find((agent) => agent.id === agentId)?.name
            : "Выберите агента..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0">
        <Command>
          <CommandInput placeholder="Поиск по агентам..." />
          <CommandEmpty>Не найдено агентов.</CommandEmpty>
          <CommandGroup heading="Торговые агенты">
            <CommandList>
              {agents.map((agent) => (
                <CommandItem
                  key={agent.id}
                  value={agent.id}
                  // @ts-ignore
                  keywords={[agent.name ?? "", agent?.meta?.realName ?? ""]}
                  onSelect={(currentValue) => {
                    setAgentId(currentValue === agentId ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      agentId === agent.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {agent.name}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AgentSelect;
