﻿// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Integration.Shrine4_1;
using System.Linq;

namespace API.DTO.Integration.Shrine4_1
{
    public class ShrineQueryDefinitionDTO
    {
        public ShrineConjunctionDTO Expression { get; set; }

        public ShrineQueryDefinitionDTO() { }

        public ShrineQueryDefinitionDTO(ShrineQueryDefinition definition)
        {
            Expression = new ShrineConjunctionDTO(definition.Expression);
        }
    }

    public abstract class ShrineGroupDTO
    {
        public int NMustBeTrue { get; set; }
        public string EncodedClass { get; set; }
        public ShrineConjunctionCompareDTO Compare { get; set; }

        public ShrineGroupDTO() { }

        public ShrineGroupDTO(ShrineGroup expr)
        {
            NMustBeTrue = expr.NMustBeTrue;
            Compare = new ShrineConjunctionCompareDTO(expr.Compare);
        }
    }

    public class ShrineConjunctionDTO
    {
        public int NMustBeTrue { get; set; }
        public string EncodedClass { get; set; }
        public ShrineConjunctionCompareDTO Compare { get; set; }
        public IEnumerable<ShrineConceptGroupOrTimelineDTO> Possibilities { get; set; }

        public ShrineConjunctionDTO() { }

        public ShrineConjunctionDTO(ShrineConjunction conjunction)
        {
            Possibilities = conjunction.Possibilities.Select(p => new ShrineConceptGroupDTO(p));
        }
    }

    public class ShrineConceptGroupOrTimelineDTO : ShrineConceptGroupDTO
    {
        public ShrineConceptGroupDTO First { get; set; }
        public IEnumerable<ShrineTimelineSubsequentEventDTO> Subsequent { get; set; } = new List<ShrineTimelineSubsequentEventDTO>();

        public bool IsConceptGroup => First == null;
        public bool IsTimeline => First != null;
    }

    public class ShrineTimelineSubsequentEventDTO
    {
        public ShrineConceptGroupDTO ConceptGroup { get; set; }
        public ShrineTimelineSubsequentEventOccurrenceDTO PreviousOccurrence { get; set; }
        public ShrineTimelineSubsequentEventOccurrenceDTO ThisOccurrence { get; set; }
        public ShrineTimelineSubsequentEventTimeConstraintDTO TimeConstraint { get; set; }

        public ShrineTimelineSubsequentEventDTO() { }
    }

    public class ShrineTimelineSubsequentEventOccurrenceDTO
    {
        public string EncodedClass { get; set; }
    }

    public class ShrineTimelineSubsequentEventTimeConstraintDTO
    {
        public ShrineOperatorDTO Operator { get; set; }
        public double Value { get; set; }
        public ShrineTimeUnitDTO TimeUnit { get; set; }
    }

    public class ShrineOperatorDTO
    {
        public string EncodedClass { get; set; }
    }

    public class ShrineTimeUnitDTO
    {
        public string EncodedClass { get; set; }
    }

    public class ShrineConceptGroupDTO : ShrineGroupDTO
    {
        public long? StartDate { get; set; }
        public long? EndDate { get; set; }
        public int OccursAtLeast { get; set; } = 1;
        public ShrineConceptConjunctionDTO Concepts { get; set; }

        public ShrineConceptGroupDTO() { }

        public ShrineConceptGroupDTO(ShrineConceptGroup group) : base(group)
        {
            StartDate = group.StartDate != null ? ((DateTimeOffset)group.StartDate).ToUnixTimeMilliseconds() : null;
            EndDate = group.EndDate != null ? ((DateTimeOffset)group.EndDate).ToUnixTimeMilliseconds() : null;
            OccursAtLeast = group.OccursAtLeast.HasValue ? (int)group.OccursAtLeast : 1;
            Concepts = new ShrineConceptConjunctionDTO(group.Concepts);
        }
    }

    public class ShrineConceptConjunctionDTO
    {
        public int NMustBeTrue { get; set; }
        public string EncodedClass { get; set; }
        public ShrineConjunctionCompareDTO Compare { get; set; }
        public IEnumerable<ShrineConceptDTO> Possibilities { get; set; }

        public ShrineConceptConjunctionDTO() { }

        public ShrineConceptConjunctionDTO(ShrineConceptConjunction conjunction)
        {
            NMustBeTrue = conjunction.NMustBeTrue;
            Compare = new ShrineConjunctionCompareDTO(conjunction.Compare);
            Possibilities = conjunction.Possibilities.Select(p => new ShrineConceptDTO(p));
        }
    }

    public class ShrineConceptDTO
    {
        public string DisplayName { get; set; }
        public string TermPath { get; set; }
        public string Constraint { get; set; }
        public static readonly string EncodedClass = "Concept";

        public ShrineConceptDTO() { }

        public ShrineConceptDTO(ShrineConcept concept)
        {
            DisplayName = concept.DisplayName;
            TermPath = concept.TermPath;
            Constraint = concept.Constraint;
        }
    }

    public class ShrineConjunctionCompareDTO
    {
        public string EncodedClass { get; set; }

        public ShrineConjunctionCompareDTO() { }

        public ShrineConjunctionCompareDTO(ShrineConjunctionCompare compare)
        {
            EncodedClass = compare.EncodedClass.ToString();
        }
    }

    public static class ShrineQueryDefinitionExtensions
    {
        public static ShrineConjunctionCompare ToCompare(this ShrineConjunctionCompareDTO dto)
        {
            _ = Enum.TryParse(dto.EncodedClass, out ShrineConjunctionComparison encodedClass);
            return new ShrineConjunctionCompare
            {
                EncodedClass = encodedClass
            };
        }

        public static ShrineConcept ToConcept(this ShrineConceptDTO dto)
        {
            return new ShrineConcept
            {
                DisplayName = dto.DisplayName,
                TermPath = dto.TermPath,
                Constraint = dto.Constraint
            };
        }

        public static ShrineConceptGroup ToConceptGroup(this ShrineConceptGroupDTO dto)
        {
            return new ShrineConceptGroup
            {
                StartDate = dto.StartDate != null ? DateTimeOffset.FromUnixTimeMilliseconds((long)dto.StartDate).UtcDateTime : null,
                EndDate = dto.EndDate != null ? DateTimeOffset.FromUnixTimeMilliseconds((long)dto.EndDate).UtcDateTime : null,
                OccursAtLeast = dto.OccursAtLeast,
                Concepts = dto.Concepts.ToConjunction()
            };
        }

        public static ShrineConjunction ToConjunction(this ShrineConjunctionDTO dto)
        {
            return new ShrineConjunction
            {
                NMustBeTrue = dto.NMustBeTrue,
                Compare = dto.Compare.ToCompare(),
                Possibilities = dto.Possibilities.Select(p => p.ToConceptGroup())
            };
        }

        public static ShrineConceptConjunction ToConjunction(this ShrineConceptConjunctionDTO dto)
        {
            return new ShrineConceptConjunction
            {
                NMustBeTrue = dto.NMustBeTrue,
                Compare = dto.Compare.ToCompare(),
                Possibilities = dto.Possibilities.Select(p => p.ToConcept())
            };
        }


        public static ShrineQueryDefinition ToDefinition(this ShrineQueryDefinitionDTO dto)
        {
            return new ShrineQueryDefinition
            {
                Expression = dto.Expression.ToConjunction()
            };
        }
    }
}

