//go:build wasip1 && wasm

package main

import (
	"bamboo-core"
	"bufio"
	"strings"
	"unsafe"
)

var (
	nextHandle   uint32 = 1
	engines             = map[uint32]*FcitxBambooEngine{}
	dictionaries        = map[uint32]*map[string]bool{}
	macroTables         = map[uint32]*MacroTable{}
	inputBuffer  []byte
	outputBuffer []byte
)

func newHandle() uint32 {
	handle := nextHandle
	nextHandle++
	if nextHandle == 0 {
		nextHandle = 1
	}
	return handle
}

func setOutput(value string) uint32 {
	outputBuffer = []byte(value)
	return uint32(len(outputBuffer))
}

func unpackPairs(value string) [][2]string {
	parts := strings.Split(value, "\x00")
	result := make([][2]string, 0, len(parts)/2)
	for i := 0; i+1 < len(parts); i += 2 {
		result = append(result, [2]string{
			strings.Clone(parts[i]),
			strings.Clone(parts[i+1]),
		})
	}
	return result
}

func newEngine(imName string, dictionary map[string]bool, table *MacroTable, spellCheck bool, definitions map[string]bamboo.InputMethodDefinition) uint32 {
	engine := &FcitxBambooEngine{
		preeditor:               bamboo.NewEngine(bamboo.ParseInputMethod(definitions, imName), bamboo.EstdFlags),
		macroTable:              table,
		dictionary:              dictionary,
		autoNonVnRestore:        true,
		ddFreeStyle:             true,
		macroEnabled:            false,
		autoCapitalizeMacro:     false,
		lastKeyWithShift:        false,
		spellCheckWithDicts:     spellCheck,
		preeditText:             "",
		commitText:              "",
		shouldRestoreKeyStrokes: false,
		outputCharset:           "Unicode",
	}
	handle := newHandle()
	engines[handle] = engine
	return handle
}

//go:wasmexport BambooInputBuffer
func bambooInputBuffer(size uint32) unsafe.Pointer {
	if cap(inputBuffer) < int(size) {
		inputBuffer = make([]byte, size)
	} else {
		inputBuffer = inputBuffer[:size]
	}
	if size == 0 {
		return nil
	}
	return unsafe.Pointer(&inputBuffer[0])
}

//go:wasmexport BambooOutputPointer
func bambooOutputPointer() unsafe.Pointer {
	if len(outputBuffer) == 0 {
		return nil
	}
	return unsafe.Pointer(&outputBuffer[0])
}

//go:wasmexport Init
func wasmInit() {}

//go:wasmexport EngineProcessKeyEvent
func wasmEngineProcessKeyEvent(handle, keyVal, state uint32) bool {
	engine, ok := engines[handle]
	return ok && engine.preeditProcessKeyEvent(keyVal, state)
}

//go:wasmexport EngineSetRestoreKeyStroke
func wasmEngineSetRestoreKeyStroke(handle uint32) {
	if engine, ok := engines[handle]; ok {
		engine.shouldRestoreKeyStrokes = true
	}
}

//go:wasmexport EnginePullPreedit
func wasmEnginePullPreedit(handle uint32) uint32 {
	if engine, ok := engines[handle]; ok {
		return setOutput(engine.preeditText)
	}
	return setOutput("")
}

//go:wasmexport EngineCommitPreedit
func wasmEngineCommitPreedit(handle uint32) {
	if engine, ok := engines[handle]; ok {
		engine.commitPreeditAndReset(engine.getPreeditString())
	}
}

//go:wasmexport EnginePullCommit
func wasmEnginePullCommit(handle uint32) uint32 {
	if engine, ok := engines[handle]; ok {
		commit := engine.commitText
		engine.commitText = ""
		return setOutput(commit)
	}
	return setOutput("")
}

//go:wasmexport EngineSetOption
func wasmEngineSetOption(handle uint32, autoNonVnRestore, ddFreeStyle, macroEnabled, autoCapitalizeMacro, spellCheckWithDicts bool, outputCharset string, modernStyle, freeMarking bool) {
	engine, ok := engines[handle]
	if !ok {
		return
	}
	engine.autoNonVnRestore = autoNonVnRestore
	engine.ddFreeStyle = ddFreeStyle
	engine.macroEnabled = macroEnabled
	engine.autoCapitalizeMacro = autoCapitalizeMacro
	engine.spellCheckWithDicts = spellCheckWithDicts
	engine.outputCharset = strings.Clone(outputCharset)
	flags := bamboo.EstdFlags
	if modernStyle {
		flags &= ^bamboo.EstdToneStyle
	} else {
		flags |= bamboo.EstdToneStyle
	}
	if freeMarking {
		flags |= bamboo.EfreeToneMarking
	} else {
		flags &= ^bamboo.EfreeToneMarking
	}
	engine.preeditor.SetFlag(flags)
}

//go:wasmexport NewEngine
func wasmNewEngine(name string, dictHandle, tableHandle uint32) uint32 {
	dictionary, dictOK := dictionaries[dictHandle]
	table, tableOK := macroTables[tableHandle]
	if !dictOK || !tableOK {
		return 0
	}
	return newEngine(name, *dictionary, table, true, bamboo.InputMethodDefinitions)
}

//go:wasmexport NewCustomEngine
func wasmNewCustomEngine(packedDefinition string, dictHandle, tableHandle uint32) uint32 {
	dictionary, dictOK := dictionaries[dictHandle]
	table, tableOK := macroTables[tableHandle]
	if !dictOK || !tableOK {
		return 0
	}
	definition := bamboo.InputMethodDefinition{}
	for _, pair := range unpackPairs(packedDefinition) {
		definition[pair[0]] = pair[1]
	}
	definitions := map[string]bamboo.InputMethodDefinition{"Custom": definition}
	return newEngine("Custom", *dictionary, table, false, definitions)
}

//go:wasmexport NewMacroTable
func wasmNewMacroTable(packedDefinition string) uint32 {
	table := &MacroTable{mTable: map[string]string{}}
	for _, pair := range unpackPairs(packedDefinition) {
		table.mTable[pair[0]] = pair[1]
	}
	handle := newHandle()
	macroTables[handle] = table
	return handle
}

//go:wasmexport DeleteObject
func wasmDeleteObject(handle uint32) {
	delete(engines, handle)
	delete(dictionaries, handle)
	delete(macroTables, handle)
}

//go:wasmexport ResetEngine
func wasmResetEngine(handle uint32) {
	if engine, ok := engines[handle]; ok {
		engine.commitPreeditAndReset("")
	}
}

//go:wasmexport GetCharsetNames
func wasmGetCharsetNames() uint32 {
	return setOutput(strings.Join(bamboo.GetCharsetNames(), "\x00"))
}

//go:wasmexport GetInputMethodNames
func wasmGetInputMethodNames() uint32 {
	names := make([]string, 0, len(bamboo.InputMethodDefinitions))
	for name := range bamboo.InputMethodDefinitions {
		names = append(names, name)
	}
	return setOutput(strings.Join(names, "\x00"))
}

//go:wasmexport NewDictionary
func wasmNewDictionary(contents string) uint32 {
	data := map[string]bool{}
	scanner := bufio.NewScanner(strings.NewReader(contents))
	for scanner.Scan() {
		line := scanner.Text()
		if line != "" {
			data[strings.ToLower(line)] = true
		}
	}
	handle := newHandle()
	dictionaries[handle] = &data
	return handle
}

func main() {}
