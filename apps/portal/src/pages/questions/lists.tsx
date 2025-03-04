import Head from 'next/head';
import { useState } from 'react';
import { Menu } from '@headlessui/react';
import {
  EllipsisVerticalIcon,
  NoSymbolIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

import QuestionListCard from '~/components/questions/card/question/QuestionListCard';
import type { CreateListFormData } from '~/components/questions/CreateListDialog';
import CreateListDialog from '~/components/questions/CreateListDialog';
import DeleteListDialog from '~/components/questions/DeleteListDialog';

import { Button } from '~/../../../packages/ui/dist';
import { APP_TITLE } from '~/utils/questions/constants';
import createSlug from '~/utils/questions/createSlug';
import relabelQuestionAggregates from '~/utils/questions/relabelQuestionAggregates';
import { useProtectedCallback } from '~/utils/questions/useProtectedCallback';
import { trpc } from '~/utils/trpc';

export default function ListPage() {
  const utils = trpc.useContext();
  const { data: lists } = trpc.useQuery(['questions.lists.getListsByUser']);
  const { mutateAsync: createList } = trpc.useMutation(
    'questions.lists.create',
    {
      onSuccess: () => {
        // TODO: Add optimistic update
        utils.invalidateQueries(['questions.lists.getListsByUser']);
      },
    },
  );
  const { mutateAsync: deleteList } = trpc.useMutation(
    'questions.lists.delete',
    {
      onSuccess: () => {
        // TODO: Add optimistic update
        utils.invalidateQueries(['questions.lists.getListsByUser']);
      },
    },
  );
  const { mutateAsync: deleteQuestionEntry } = trpc.useMutation(
    'questions.lists.deleteQuestionEntry',
    {
      onSuccess: () => {
        // TODO: Add optimistic update
        utils.invalidateQueries(['questions.lists.getListsByUser']);
      },
    },
  );

  const [selectedListIndex, setSelectedListIndex] = useState(0);
  const [showDeleteListDialog, setShowDeleteListDialog] = useState(false);
  const [showCreateListDialog, setShowCreateListDialog] = useState(false);

  const [listIdToDelete, setListIdToDelete] = useState('');

  const handleDeleteList = async (listId: string) => {
    await deleteList({
      id: listId,
    });
    setShowDeleteListDialog(false);
  };

  const handleDeleteListCancel = () => {
    setShowDeleteListDialog(false);
  };

  const handleCreateList = async (data: CreateListFormData) => {
    await createList({
      name: data.name,
    });
    setShowCreateListDialog(false);
  };

  const handleCreateListCancel = () => {
    setShowCreateListDialog(false);
  };

  const handleAddClick = useProtectedCallback(() => {
    setShowCreateListDialog(true);
  });

  const listOptions = (
    <>
      <ul className="flex flex-1 flex-col divide-y divide-solid divide-slate-200">
        {(lists ?? []).map((list, index) => (
          <li
            key={list.id}
            className={`flex items-center hover:bg-slate-50 ${
              selectedListIndex === index ? 'bg-primary-100' : ''
            }`}>
            <button
              className="flex w-full flex-1 justify-between  "
              type="button"
              onClick={() => {
                setSelectedListIndex(index);
              }}>
              <p className="text-primary-700 text-md p-3 pl-6 font-medium">
                {list.name}
              </p>
            </button>
            <div>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex w-full justify-center rounded-md p-2 text-sm font-medium text-white">
                    <EllipsisVerticalIcon
                      aria-hidden="true"
                      className="hover:text-primary-700 mr-1 h-5 w-5 text-violet-400"
                    />
                  </Menu.Button>
                </div>
                <Menu.Items className="w-18 absolute right-0 z-10 mr-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1 ">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active
                              ? 'bg-violet-500 text-white'
                              : 'text-slate-900'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          type="button"
                          onClick={() => {
                            setShowDeleteListDialog(true);
                            setListIdToDelete(list.id);
                          }}>
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            </div>
          </li>
        ))}
      </ul>
      {lists?.length === 0 && (
        <div className="mx-2 flex items-center justify-center gap-2 rounded-md bg-slate-200 p-4 text-slate-600">
          <p>You have yet to create a list</p>
        </div>
      )}
    </>
  );

  return (
    <>
      <Head>
        <title>My Lists - {APP_TITLE}</title>
      </Head>
      <main className="flex flex-1 flex-col items-stretch">
        <div className="flex h-full flex-1">
          <aside className="w-[300px] overflow-y-auto border-r bg-white py-4 lg:block">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="px-4 text-xl font-semibold">My Lists</h2>
              <div className="px-4">
                <Button
                  icon={PlusIcon}
                  isLabelHidden={true}
                  label="Create"
                  size="md"
                  variant="tertiary"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleAddClick();
                  }}
                />
              </div>
            </div>
            {listOptions}
          </aside>
          <section className="flex min-h-0 flex-1 flex-col items-center overflow-auto">
            <div className="flex min-h-0 max-w-3xl flex-1 p-4">
              <div className="flex flex-1 flex-col items-stretch justify-start gap-4">
                {lists?.[selectedListIndex] && (
                  <div className="flex flex-col gap-4 pb-4">
                    {lists[selectedListIndex].questionEntries.map(
                      ({ question, id: entryId }) => {
                        const { companyCounts, countryCounts, roleCounts } =
                          relabelQuestionAggregates(
                            question.aggregatedQuestionEncounters,
                          );

                        return (
                          <QuestionListCard
                            key={question.id}
                            companies={companyCounts}
                            content={question.content}
                            countries={countryCounts}
                            href={`/questions/${question.id}/${createSlug(
                              question.content,
                            )}`}
                            questionId={question.id}
                            receivedCount={question.receivedCount}
                            roles={roleCounts}
                            timestamp={question.seenAt.toLocaleDateString(
                              undefined,
                              {
                                month: 'short',
                                year: 'numeric',
                              },
                            )}
                            type={question.type}
                            onDelete={() => {
                              deleteQuestionEntry({ id: entryId });
                            }}
                          />
                        );
                      },
                    )}
                    {lists[selectedListIndex].questionEntries?.length === 0 && (
                      <div className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-slate-200 p-4 text-slate-600">
                        <NoSymbolIcon className="h-6 w-6" />
                        <p>
                          You have not added any questions to your list yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <DeleteListDialog
              show={showDeleteListDialog}
              onCancel={handleDeleteListCancel}
              onDelete={() => {
                handleDeleteList(listIdToDelete);
              }}
            />
            <CreateListDialog
              show={showCreateListDialog}
              onCancel={handleCreateListCancel}
              onSubmit={handleCreateList}
            />
          </section>
        </div>
      </main>
    </>
  );
}
