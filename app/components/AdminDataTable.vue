<template>
  <div class="overflow-x-auto rounded-lg border border-ink/10 bg-white">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-slate-soft">
          <th
            v-for="column in columns"
            :key="column.key"
            class="p-2.5 font-medium"
            :class="column.headerClass"
            scope="col"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="getRowKey(row, index)"
          class="border-b border-ink/5 last:border-b-0"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="p-2.5"
            :class="column.cellClass"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="getCellValue(row, column.key)"
              :column="column"
            >
              {{ getCellValue(row, column.key) ?? '—' }}
            </slot>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="p-5 text-center text-sm text-slate-soft">
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export type AdminDataTableColumn = {
  key: string
  label: string
  headerClass?: string
  cellClass?: string
}

const props = withDefaults(defineProps<{
  columns: AdminDataTableColumn[]
  rows: Record<string, any>[]
  rowKey?: string
  emptyText?: string
}>(), {
  rowKey: 'id',
  emptyText: 'No records found.',
})

function getRowKey(row: Record<string, any>, index: number) {
  return row[props.rowKey] ?? index
}

function getCellValue(row: Record<string, any>, key: string) {
  return key.split('.').reduce((value, part) => value?.[part], row)
}
</script>
